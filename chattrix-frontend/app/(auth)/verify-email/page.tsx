"use client"
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Alert from "@/components/ui/Alert";
import { resendVerificationEmail, verifyEmail } from "@/lib/authClient";
import { useAppSelector } from "@/lib/hooks";
import { useRefreshUser } from "@/lib/useRefreshUser";
import { safeNext } from "@/lib/safeNext";

// Handles both "clicked the emailed link" and "unverified, waiting" — same page either way.
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refreshUser = useRefreshUser();
  const user = useAppSelector((state) => state.user.data);

  // Set by the invite flow and round-tripped through the emailed link, so verifying from the
  // inbox lands back on the invitation instead of the dashboard.
  const next = safeNext(searchParams.get("next"));

  const hasToken = Boolean(
    searchParams.get("id") && searchParams.get("hash") && searchParams.get("signature")
  );

  // status: "pending" | "verifying" | "verified" | "error"
  const [status, setStatus] = useState(hasToken ? "verifying" : "pending");
  const [message, setMessage] = useState("");
  const [resendStatus, setResendStatus] = useState("idle"); // idle | sending | sent | error

  useEffect(() => {
    if (!hasToken) {
      return;
    }

    const query = searchParams.toString();

    verifyEmail(query)
      .then(async (response) => {
        setStatus("verified");
        setMessage(response.data.message);

        // Only skip the login link if this browser already has a session.
        const freshUser = await refreshUser();

        if (freshUser) {
          router.replace(next);
        }
      })
      .catch((error) => {
        setStatus("error");
        setMessage(
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Something went wrong while verifying your email."
        );
      });
  }, [hasToken, searchParams, router, refreshUser, next]);

  const handleResend = async () => {
    setResendStatus("sending");
    try {
      await resendVerificationEmail(next);
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-overlay rounded-xl border border-white/5 shadow-xl space-y-7 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>

      {status === "pending" && (
        <>
          <p className="text-dim text-sm">
            We sent a verification link to{" "}
            <span className="text-ink font-medium">{user?.email}</span>. Click it, then
            refresh this page.
          </p>

          {resendStatus === "sent" && <Alert tone="success">Verification email sent.</Alert>}
          {resendStatus === "error" && (
            <Alert tone="error">Could not send the email. Try again shortly.</Alert>
          )}

          <button
            onClick={handleResend}
            disabled={resendStatus === "sending"}
            className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {resendStatus === "sending" ? "Sending…" : "Resend verification email"}
          </button>
        </>
      )}

      {status === "verifying" && (
        <p className="text-dim text-sm">Verifying your email address…</p>
      )}

      {(status === "verified" || status === "error") && (
        <>
          <Alert tone={status === "verified" ? "success" : "error"}>{message}</Alert>

          {status === "verified" && user ? (
            <p className="text-dim text-sm">Redirecting…</p>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="inline-block text-red-400 hover:text-red-300 transition-colors text-sm"
            >
              {status === "verified" ? "Continue to log in" : "Back to log in"}
            </Link>
          )}
        </>
      )}
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
