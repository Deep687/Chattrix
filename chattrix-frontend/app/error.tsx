"use client" // Error boundaries must be Client Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusPage from "@/components/StatusPage";
import { Button, ButtonLink } from "@/components/ui/Button";

/** Errors outside the app shell: landing and auth pages. */
export default function RootError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
    return (
        <div className="flex min-h-dvh flex-col text-ink">
            <Navbar />
            <main id="main-content" className="mx-auto flex w-full max-w-7xl grow flex-col px-4 sm:px-6">
                <StatusPage
                    code="!"
                    eyebrow="Something went wrong"
                    title="This page didn't load"
                    actions={
                        <>
                            <Button onClick={() => unstable_retry()}>Try again</Button>
                            <ButtonLink href="/" variant="secondary">Home</ButtonLink>
                        </>
                    }
                >
                    It&apos;s probably a temporary problem reaching the server.
                </StatusPage>
            </main>
            <Footer />
        </div>
    );
}
