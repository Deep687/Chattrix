import axios from "axios";

// Thin wrappers around the Next.js proxy routes — keeps the literal paths out of components.
export function verifyEmail(query: string) {
    return axios.get(`/api/auth/verify-email?${query}`);
}

/** `next` rides along into the emailed link so verifying can return to an invite. */
export function resendVerificationEmail(next?: string) {
    return axios.post("/api/auth/email/resend", next ? { next } : {});
}
