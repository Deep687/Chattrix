"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { setUser, clearUser } from "@/lib/features/userSlice";
import { useAppDispatch } from "@/lib/hooks";

export default function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const dispatch = useAppDispatch();

    const getUser = async () => {
        try {
            const response = await axios.get("/api/auth/me");

            dispatch(setUser(response.data.data.user));
        } catch {
            dispatch(clearUser());
        }
    };

    useEffect(() => {
        void getUser();
    }, []);

    return <>{children}</>;
}