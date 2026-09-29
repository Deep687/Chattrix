import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Icon from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { Workspace } from "@/lib/types";

/** Empty until ingestion ships (M1). The upload button is shown disabled so the next step is visible, not hidden. */
export default function DocumentsPanel({ workspace }: { workspace: Workspace }) {
    return (
        <Card as="section" className="px-6 pt-6 pb-7 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="eyebrow">
                        <span className="text-brand-ink">03 · </span>Documents
                    </p>
                    <h2 className="mt-2 font-serif text-2xl leading-tight font-semibold tracking-tight text-ink">Source documents</h2>
                    <p className="mt-1.5 font-mono text-[0.6875rem] tracking-[0.12em] text-muted uppercase">0 indexed · PDF, TXT or MD</p>
                </div>

                <Button variant="secondary" disabled>
                    <Icon name="upload" className="size-4" />
                    Upload document
                </Button>
            </div>

            <div className="mt-6">
                <EmptyState icon="upload" title="No documents yet">
                    <p>
                        {workspace.is_owner
                            ? `Upload ${workspace.name}'s HR handbook, IT and security policy, or leave and benefits docs. Members can then ask questions against them.`
                            : `Once ${workspace.name}'s policies are uploaded, you'll be able to ask questions against them here.`}
                    </p>
                    <p className="eyebrow mt-3">Uploading is coming soon</p>
                </EmptyState>
            </div>
        </Card>
    );
}
