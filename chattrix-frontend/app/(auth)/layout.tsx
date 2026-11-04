import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/** The shell every auth page shares: the app header, one centred column, the footer. */
export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-dvh flex-col text-ink">
            <Navbar />
            <main id="main-content" className="mx-auto flex w-full max-w-7xl grow flex-col px-4 py-12 sm:px-6 sm:py-16">
                {children}
            </main>
            <Footer />
        </div>
    );
}
