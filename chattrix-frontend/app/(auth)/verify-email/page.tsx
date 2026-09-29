"use client"
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import AuthCard from "@/components/AuthCard";
import Alert from "@/components/ui/Alert";
import Icon, { type IconName } from "@/components/ui/Icon";
import { Button, Spinner, linkClass } from "@/components/ui/Button";
import { resendVerificationEmail, verifyEmail } from "@/lib/authClient";
import { useAppSelector } from "@/lib/hooks";
import { useRefreshUser } from "@/lib/useRefreshUser";
import { safeNext } from "@/lib/safeNext";

type Status = "pending" | "verifying" | "verified" | "error";

const TILE: Record<Status, { icon: IconName; className: string }> = {
  pending: { icon: "mail", className: "border-brand/45 text-brand-ink" },
  verifying: { icon: "mail", className: "border-brand/45 text-brand-ink" },
  verified: { icon: "check", className: "border-success-ink/50 text-success-ink" },
  error: { icon: "close", className: "border-danger/50 text-danger-ink" },
};

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

  const [status, setStatus] = useState<Status>(hasToken ? "verifying" : "pending");
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

  const titles: Record<Status, string> = {
    pending: "Check your inbox",
    verifying: "Verifying your email",
    verified: "Email verified",
    error: "Link didn't work",
  };

  return (
    <AuthCard eyebrow="Verify email" title={titles[status]}>
      <span className={`mx-auto -mt-2 inline-flex size-14 items-center justify-center rounded-full border-2 border-double bg-surface ${TILE[status].className}`}>
        {status === "verifying" ? <Spinner className="size-6" /> : <Icon name={TILE[status].icon} className="size-6" />}
      </span>

      {status === "pending" && (
        <>
          <div className="ruled rounded-card border border-hairline py-4 ps-16 pe-5">
            <p className="eyebrow">Sent to</p>
            {user?.email ? (
              <p className="mt-1 font-serif text-lg leading-snug font-semibold break-all text-ink">{user.email}</p>
            ) : (
              <p className="mt-1 font-serif text-lg leading-snug text-muted italic">the address you signed up with</p>
            )}
            <p className="mt-1.5 text-sm text-pretty text-muted">Click the link in that email, then refresh this page.</p>
          </div>

          {resendStatus === "sent" && <Alert tone="success">Verification email sent.</Alert>}
          {resendStatus === "error" && (
            <Alert tone="error">Could not send the email. Try again shortly.</Alert>
          )}

          <Button variant="secondary" fullWidth onClick={handleResend} loading={resendStatus === "sending"}>
            {resendStatus === "sending" ? "Sending…" : "Resend verification email"}
          </Button>
        </>
      )}

      {status === "verifying" && (
        <p aria-live="polite" className="text-center text-sm text-muted">
          Confirming your address. This takes a moment.
        </p>
      )}

      {(status === "verified" || status === "error") && (
        <>
          <Alert tone={status === "verified" ? "success" : "error"}>{message}</Alert>

          {status === "verified" && user ? (
            <p className="inline-flex items-center justify-center gap-2 text-sm text-muted">
              <Spinner /> Redirecting…
            </p>
          ) : (
            <p className="text-center text-sm">
              <Link href={`/login?next=${encodeURIComponent(next)}`} className={linkClass}>
                {status === "verified" ? "Continue to log in" : "Back to log in"}
              </Link>
            </p>
          )}
        </>
      )}
    </AuthCard>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
