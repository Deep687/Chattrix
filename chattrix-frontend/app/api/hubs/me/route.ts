import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function GET() {
    return proxyToBackend(`${API_ROUTES.hubs}/me`, {
        errorLabel: "Hubs Me Route",
    });
}
