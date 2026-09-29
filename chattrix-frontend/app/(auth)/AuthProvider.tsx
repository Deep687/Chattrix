"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { useRefreshUser } from "@/lib/useRefreshUser";
import AuthListener from "@/components/AuthListener";

// Unverified users get redirected here; also exempt from the check below.
const VERIFICATION_PAGE = "/verify-email";

export default function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const user = useAppSelector((state) => state.user.data);
    const refreshUser = useRefreshUser();

    // Fetch the user once on mount.
    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);

    // Redirect if unverified, on user load or route change.
    useEffect(() => {
        const isUnverified = user && !user.email_verified_at;

        if (isUnverified && pathname !== VERIFICATION_PAGE) {
            router.replace(VERIFICATION_PAGE);
        }
    }, [user, pathname, router]);

    return (
        <>
            <AuthListener />
            {children}
        </>
    );
}