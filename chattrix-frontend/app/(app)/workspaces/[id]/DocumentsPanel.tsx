"use client"
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Icon from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { ApiResponse, DocumentStatus, Workspace, WorkspaceDocument } from "@/lib/types";

/** Mirrors `UploadDocumentRequest`: pdf/txt/md, `max:10240` (kilobytes). */
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.txt,.md,application/pdf,text/plain,text/markdown";
const POLL_MS = 3000;

const STATUS: Record<DocumentStatus, { label: string; tone: "muted" | "accent" | "success" | "danger" }> = {
    pending: { label: "Queued", tone: "muted" },
    processing: { label: "Indexing", tone: "accent" },
    ready: { label: "Ready", tone: "success" },
    failed: { label: "Failed", tone: "danger" },
};

/**
 * Upload, list and delete. Only the owner curates documents (the backend enforces it; this only
 * hides the controls), since whatever is uploaded is cited as company policy. Embedding runs in a queue, so the list polls while anything is still
 * queued or indexing, and refreshes the page once a document turns ready: that is what unlocks Ask,
 * which reads its state from the server render.
 */
export default function DocumentsPanel({ workspace, initialDocuments }: { workspace: Workspace; initialDocuments: WorkspaceDocument[] }) {
    const router = useRouter();
    const fileInput = useRef<HTMLInputElement>(null);

    const [documents, setDocuments] = useState<WorkspaceDocument[]>(initialDocuments);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState("");

    const canManage = workspace.is_owner;
    const inFlight = documents.some((d) => d.status === "pending" || d.status === "processing");
    const readyCount = documents.filter((d) => d.status === "ready").length;

    useEffect(() => {
        if (!inFlight) {
            return;
        }

        const timer = setInterval(async () => {
            try {
                const { data } = await axios.get<ApiResponse<WorkspaceDocument[]>>(`/api/workspaces/${workspace.id}/documents`);
                const becameReady = data.data.some((d) => d.status === "ready" && documents.find((old) => old.id === d.id)?.status !== "ready");

                setDocuments(data.data);

                if (becameReady) {
                    router.refresh();
                }
            } catch {
                // A missed poll is retried on the next tick; nothing to tell the user yet.
            }
        }, POLL_MS);

        return () => clearInterval(timer);
    }, [inFlight, documents, workspace.id, router]);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // Reset so choosing the same file again still fires `change`.
        e.target.value = "";

        if (!file) {
            return;
        }

        setError("");

        // Checked here too, so a 50 MB file fails instantly instead of after the upload.
        if (file.size > MAX_BYTES) {
            setError("Files can be at most 10 MB.");
            return;
        }

        const body = new FormData();
        body.append("file", file);
        setUploading(true);

        try {
            const { data } = await axios.post<ApiResponse<WorkspaceDocument>>(`/api/workspaces/${workspace.id}/documents`, body);
            setDocuments((current) => [data.data, ...current]);
        } catch (err) {
            setError(uploadError(err));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (document: WorkspaceDocument) => {
        if (!window.confirm(`Delete “${document.filename}”? Answers will stop citing it.`)) {
            return;
        }

        setError("");
        setDeletingId(document.id);

        try {
            await axios.delete(`/api/workspaces/${workspace.id}/documents/${document.id}`);
            setDocuments((current) => current.filter((d) => d.id !== document.id));
            router.refresh();
        } catch {
            setError(`Could not delete “${document.filename}”.`);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Card as="section" className="px-6 pt-6 pb-7 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">
                        <span className="text-brand-ink">03 · </span>Documents
                    </p>
                    <h2 className="mt-2 font-serif text-2xl leading-tight font-semibold tracking-tight text-ink">Source documents</h2>
                    <p className="mt-1.5 font-mono text-[0.6875rem] tracking-[0.12em] text-muted uppercase">
                        {readyCount} indexed · PDF, TXT or MD · max 10 MB
                    </p>
                </div>

                {canManage && (
                    <>
                        <input ref={fileInput} type="file" accept={ACCEPT} onChange={handleFile} className="sr-only" tabIndex={-1} aria-hidden="true" />
                        <Button variant="secondary" loading={uploading} onClick={() => fileInput.current?.click()}>
                            <Icon name="upload" className="size-4" />
                            {uploading ? "Uploading…" : "Upload document"}
                        </Button>
                    </>
                )}
            </div>

            {error && (
                <div className="mt-5">
                    <Alert tone="error">{error}</Alert>
                </div>
            )}

            {documents.length === 0 ? (
                <div className="mt-6">
                    <EmptyState icon="upload" title="No documents yet">
                        <p>
                            {canManage
                                ? `Upload ${workspace.name}'s HR handbook, IT and security policy, or leave and benefits docs. Everyone in this workspace can then ask questions against them.`
                                : `Once your workspace owner uploads ${workspace.name}'s policies, you'll be able to ask questions against them.`}
                        </p>
                    </EmptyState>
                </div>
            ) : (
                <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
                    {documents.map((document) => (
                        <li key={document.id} className="flex items-start gap-3 py-3.5">
                            <Icon name="document" className="mt-0.5 size-5 shrink-0 text-muted" />

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="truncate font-medium text-ink" title={document.filename}>{document.filename}</span>
                                    <Badge tone={STATUS[document.status].tone}>{STATUS[document.status].label}</Badge>
                                </div>
                                <p className="mt-0.5 text-xs text-muted">
                                    {document.uploader?.name ?? "Former member"} · {new Date(document.created_at).toLocaleDateString()}
                                    {document.status === "ready" && ` · ${document.chunk_count} passages`}
                                </p>
                                {document.status === "failed" && document.error && (
                                    <p className="mt-1 text-xs text-danger-ink">
                                        {document.error} Only you can see this. Delete it and upload a fixed copy.
                                    </p>
                                )}
                            </div>

                            {canManage && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Delete ${document.filename}`}
                                    loading={deletingId === document.id}
                                    onClick={() => handleDelete(document)}
                                >
                                    <Icon name="trash" className="size-3.5" />
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}

function uploadError(err: unknown): string {
    if (!axios.isAxiosError(err)) {
        return "Could not upload the file.";
    }

    if (err.response?.status === 422) {
        return err.response.data?.errors?.file?.[0] ?? "This file can't be uploaded.";
    }

    if (err.response?.status === 429) {
        return "Too many uploads. Wait a minute and try again.";
    }

    return "Could not upload the file.";
}
