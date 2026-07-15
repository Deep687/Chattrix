import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    return proxyToBackend(`${API_ROUTES.hubs}/${slug}`, {
        errorLabel: "Hub Route",
    });
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const formData = await request.formData();

    // Laravel can't parse multipart bodies on PUT, so the update is spoofed
    // via a POST with a `_method` field.
    formData.set("_method", "PUT");

    return proxyToBackend(`${API_ROUTES.hubs}/${slug}`, {
        method: "POST",
        body: formData,
        errorLabel: "Hub Update Route",
    });
}
