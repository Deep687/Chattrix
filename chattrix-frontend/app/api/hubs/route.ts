import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function GET(request: Request) {
    const { search } = new URL(request.url);

    return proxyToBackend(`${API_ROUTES.hubs}${search}`, {
        errorLabel: "Hubs Route",
    });
}

export async function POST(request: Request) {
    const formData = await request.formData();

    return proxyToBackend(API_ROUTES.hubs, {
        method: "POST",
        body: formData,
        errorLabel: "Hubs Route",
    });
}
