"use client"
import Link from "next/link";
import { Suspense, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { safeNext } from "@/lib/safeNext";
import AuthCard from "@/components/AuthCard";
import TextField from "@/components/ui/TextField";
import { Button, linkClass } from "@/components/ui/Button";

type SignUpFields = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  company_name: string;
};

type ErrorMessages = Partial<Record<keyof SignUpFields, string[]>>;

/**
 * Carries `?next=` through to login rather than consuming it: signup creates no session. It also
 * goes to the backend, which stamps it into the verification link so the inbox round trip lands on the invite.
 *
 * Arriving from an invite makes an employee account. Otherwise this registers a company: the
 * company name is sent and the backend creates its first workspace with this user as owner.
 */
function SignUpForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const fromInvite = next.startsWith("/workspace/invitations/");

  const [errors, setErrors] = useState<ErrorMessages>({});
  // Keeps the button busy while login loads, so a second click can't create a duplicate.
  const [redirecting, setRedirecting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<SignUpFields>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    company_name: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // An invitee's company_name stays "", which Laravel turns into null: no company is registered.
      await axios.post("/api/auth/signup", { ...form, next });
      setRedirecting(true);
      router.replace(`/login?created=1&next=${encodeURIComponent(next)}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      eyebrow={fromInvite ? "Create account" : "Register your company"}
      title={fromInvite ? "Create your account" : "Set up your company"}
      description={fromInvite
        ? "One account works across every workspace you're invited to."
        : "You'll own your company's workspace and invite your team to it. Joining an existing company? Use the invite link they emailed you."}
    >

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {!fromInvite && (
          <TextField
            name="company_name"
            label="Company name"
            value={form.company_name}
            onChange={handleChange}
            error={errors.company_name?.[0]}
            hint="Becomes your first workspace. You can rename it later."
            autoComplete="organization"
            required
            autoFocus
          />
        )}

        <TextField
          name="name"
          label="Full name"
          value={form.name}
          onChange={handleChange}
          error={errors.name?.[0]}
          autoComplete="name"
          required
          autoFocus={fromInvite}
        />

        <TextField
          name="email"
          type="email"
          label="Work email"
          value={form.email}
          onChange={handleChange}
          error={errors.email?.[0]}
          hint="Use the address your company invites you with."
          autoComplete="email"
          required
        />

        <TextField
          name="password"
          type="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          error={errors.password?.[0]}
          hint="At least 8 characters."
          autoComplete="new-password"
          required
        />

        <TextField
          name="password_confirmation"
          type="password"
          label="Confirm password"
          value={form.password_confirmation}
          onChange={handleChange}
          error={errors.password_confirmation?.[0]}
          autoComplete="new-password"
          required
        />

        <Button type="submit" fullWidth loading={loading || redirecting}>
          Create account
        </Button>
      </form>

      <hr className="border-hairline" />

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className={linkClass}>
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
