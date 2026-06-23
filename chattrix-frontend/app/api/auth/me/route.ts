import { cookies } from "next/headers";
import { API_ROUTES } from "@/lib/api";
export async function GET() {
    try {
        const cookieStore = await cookies();

        const accessToken =
            cookieStore.get("access_token")?.value;

        if (!accessToken) {
            return Response.json(
                { message: "No access token found" },
                { status: 401 }
            );
        }

        const backendRes = await fetch(
            API_ROUTES.auth.me,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json",
                },
            }
        );

        const data = await backendRes.json();

        return Response.json(data, {
            status: backendRes.status,
        });
    } catch (error) {
        console.error("[Me Route]", error);

        return Response.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}