"use client" // Error boundaries must be Client Components
import StatusPage from "@/components/StatusPage";
import { Button, ButtonLink } from "@/components/ui/Button";

/** Inside the app shell: a failed page keeps the sidebar, so the user can go elsewhere. */
export default function AppError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
    return (
        <StatusPage
            code="!"
            eyebrow="Something went wrong"
            title="This page didn't load"
            actions={
                <>
                    <Button onClick={() => unstable_retry()}>Try again</Button>
                    <ButtonLink href="/workspaces" variant="secondary">Your workspaces</ButtonLink>
                </>
            }
        >
            It&apos;s probably a temporary problem reaching the server. Nothing you entered was lost.
        </StatusPage>
    );
}
