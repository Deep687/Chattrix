import { cookies } from "next/headers";

type ProxyOptions = {
    method?: string;
    body?: BodyInit;
    errorLabel?: string;
};

/**
 * Forwards a request to the Laravel backend using the caller's access-token
 * cookie, and mirrors the backend's JSON body/status back to the client.
 */
export async function proxyToBackend(
    url: string,
    { method = "GET", body, errorLabel = "Backend Proxy" }: ProxyOptions = {}
): Promise<Response> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (!accessToken) {
        return Response.json(
            { message: "No access token found" },
            { status: 401 }
        );
    }

    try {
        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${accessToken.value}`,
                Accept: "application/json",
                // Only declare JSON for string bodies. Laravel ignores an unlabelled body,
                // so a POST without this arrives empty and fails validation. FormData must
                // NOT be labelled — fetch generates its own multipart boundary, and setting
                // a content type here would strip it and break file uploads.
                ...(typeof body === "string"
                    ? { "Content-Type": "application/json" }
                    : {}),
            },
            body,
        });

        const data = await response.json();

        console.log(data);

        return Response.json(data, { status: response.status });
    } catch (error) {
        console.error(`[${errorLabel}]`, error);

        return Response.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
