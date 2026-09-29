import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Only here for the tab title: the page is a client component, which can't export metadata. */
export const metadata: Metadata = { title: "Create account" };

export default function Layout({ children }: { children: ReactNode }) {
    return children;
}
