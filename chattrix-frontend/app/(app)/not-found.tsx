import StatusPage from "@/components/StatusPage";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Inside the app shell, so the sidebar stays. The copy says "doesn't exist or isn't yours" on
 * purpose: the workspace page returns 404 for both, so it never confirms another company's workspace.
 */
export default function AppNotFound() {
    return (
        <StatusPage
            code="404"
            eyebrow="Not found"
            title="Nothing here for you"
            actions={<ButtonLink href="/workspaces">Back to your workspaces</ButtonLink>}
        >
            This page doesn&apos;t exist, or it belongs to a workspace you&apos;re not a member of.
        </StatusPage>
    );
}
