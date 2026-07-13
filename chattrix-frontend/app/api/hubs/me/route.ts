import { cookies } from "next/headers";
import { API_ROUTES } from "@/lib/api";

export async function GET() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");
    const hubsMeUrl = `${API_ROUTES.hubs}/me`;

    if (!accessToken) {
        return Response.json(
            { 'message': "Invalid token" },
            {
                'status': 403

            }

        )
    }

    try {

        const response = await fetch(hubsMeUrl, {
            headers: {
                Authorization: `Bearer ${accessToken?.value}`,
                Accept: "application/json",
            }
        }
        )
        const data = await response.json();
        return Response.json(data, { status: response.status });
    } catch (error) {
        console.error("[Hubs Me Route]", error);

        return Response.json(
            { 'message': "Internal Server Error" },
            { 'status': 500 }
        );
    }
}