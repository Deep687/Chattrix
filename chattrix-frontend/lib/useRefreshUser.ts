import { useCallback } from "react";
import axios from "axios";
import { setUser, clearUser } from "@/lib/features/userSlice";
import { useAppDispatch } from "@/lib/hooks";

// Fetches the current user and syncs Redux; returns null if there's no valid session.
export function useRefreshUser() {
    const dispatch = useAppDispatch();

    return useCallback(async () => {
        try {
            const response = await axios.get("/api/auth/me");
            const user = response.data.data.user;

            dispatch(setUser(user));

            return user;
        } catch {
            dispatch(clearUser());

            return null;
        }
    }, [dispatch]);
}
