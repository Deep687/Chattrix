import { API_ROUTES } from "@/lib/api";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
        return Response.json(
            { message: "No access token found" },
            { status: 401 }
        );
    }

    const { search } = new URL(request.url);

    try {
        const response = await fetch(`${API_ROUTES.hubs}${search}`, {
            headers: {
                Authorization: `Bearer ${accessToken.value}`,
                Accept: "application/json",
            },
        });

        const data = await response.json();

        return Response.json(data, { status: response.status });
    } catch (error) {
        console.error("[Hubs Route]", error);

        return Response.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const formData = await request.formData();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    try {
        const response = await fetch(API_ROUTES.hubs, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken?.value}`,
                Accept: "application/json",
            },
            body: formData,
        });

        const data = await response.json();

        return Response.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error(error);

        return Response.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}