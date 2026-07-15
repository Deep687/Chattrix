import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function GET() {
    return proxyToBackend(API_ROUTES.auth.me, {
        errorLabel: "Me Route",
    });
}
