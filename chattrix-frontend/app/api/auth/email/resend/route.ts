import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));

    return proxyToBackend(API_ROUTES.auth.resendVerification, {
        method: "POST",
        body: JSON.stringify(body),
        errorLabel: "Resend Verification Route",
    });
}
