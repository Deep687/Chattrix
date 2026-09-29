import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusPage from "@/components/StatusPage";
import { ButtonLink } from "@/components/ui/Button";

/** Unmatched URLs anywhere in the app. */
export default function NotFound() {
    return (
        <div className="flex min-h-dvh flex-col text-ink">
            <Navbar />
            <main id="main-content" className="mx-auto flex w-full max-w-7xl grow flex-col px-4 sm:px-6">
                <StatusPage
                    code="404"
                    eyebrow="Not in the index"
                    title="This page doesn't exist"
                    actions={
                        <>
                            <ButtonLink href="/dashboard">Go to your workspaces</ButtonLink>
                            <ButtonLink href="/" variant="secondary">Home</ButtonLink>
                        </>
                    }
                >
                    The link may be mistyped, or the page may have moved.
                </StatusPage>
            </main>
            <Footer />
        </div>
    );
}
