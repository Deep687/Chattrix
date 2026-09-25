"use client";

import { useEffect } from "react";
import { subscribeToAuthChanges } from "@/lib/authChannel";
import { store } from "@/lib/store";

/**
 * Resets this tab when another one changes who is logged in.
 *
 * Reads the current user off the store at message time rather than through `useAppSelector`:
 * a selector would put `user` in the effect's dependencies and tear the subscription down and
 * back up on every user change, for a value only needed when a message actually arrives.
 */
export default function AuthListener() {
    useEffect(() => {
        return subscribeToAuthChanges((message) => {
            const currentId = store.getState().user.data?.id ?? null;

            // Same person logging in again — this tab's data is still theirs.
            if (message.type === "LOGIN" && message.userId === currentId) {
                return;
            }

            // A full reload, not `router.refresh()`: refresh re-runs the server components but
            // leaves the Redux store standing, so the stale user would survive the "fix".
            window.location.reload();
        });
    }, []);

    return null;
}
