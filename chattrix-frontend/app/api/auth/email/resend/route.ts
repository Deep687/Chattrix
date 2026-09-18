import { API_ROUTES } from "@/lib/api";
import { proxyToBackend } from "@/lib/backendProxy";

export async function POST() {
    return proxyToBackend(API_ROUTES.auth.resendVerification, {
        method: "POST",
        errorLabel: "Resend Verification Route",
    });
}
