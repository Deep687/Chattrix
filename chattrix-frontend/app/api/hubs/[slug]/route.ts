import { cookies } from "next/headers";
import { API_ROUTES } from "@/lib/api";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
        return Response.json(
            { message: "No access token found" },
            { status: 401 }
        );
    }

    const { slug } = await params;

    try {
        const response = await fetch(`${API_ROUTES.hubs}/${slug}`, {
            headers: {
                Authorization: `Bearer ${accessToken.value}`,
                Accept: "application/json",
            },
        });

        const data = await response.json();

        return Response.json(data, { status: response.status });
    } catch (error) {
        console.error("[Hub Route]", error);

        return Response.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
