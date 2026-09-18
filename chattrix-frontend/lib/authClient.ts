import axios from "axios";

// Thin wrappers around the Next.js proxy routes — keeps the literal paths out of components.
export function verifyEmail(query: string) {
    return axios.get(`/api/auth/verify-email?${query}`);
}

export function resendVerificationEmail() {
    return axios.post("/api/auth/email/resend");
}
