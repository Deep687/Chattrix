import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function GET() {
    return proxyToBackend(API_ROUTES.auth.me, {
        errorLabel: "Me Route",
    });
}

export async function POST(request: Request) {
    const formData = await request.formData();

    // Laravel can't parse multipart bodies on PUT, so the update is spoofed
    // via a POST with a `_method` field.
    formData.set("_method", "PUT");

    return proxyToBackend(API_ROUTES.auth.me, {
        method: "POST",
        body: formData,
        errorLabel: "Profile Update Route",
    });
}
