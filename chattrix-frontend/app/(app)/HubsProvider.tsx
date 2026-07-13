"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { setHubs, clearHubs } from "@/lib/features/hubsSlice";
import { useAppDispatch } from "@/lib/hooks";

export default function HubsProvider({
    children,
}: {
    children: ReactNode;
}) {
    const dispatch = useAppDispatch();

    const getHubs = async () => {
        try {
            const response = await axios.get("/api/hubs/me");

            dispatch(setHubs(response.data.data));
        } catch {
            dispatch(clearHubs());
        }
    };

    useEffect(() => {
        void getHubs();
    }, []);

    return <>{children}</>;
}
