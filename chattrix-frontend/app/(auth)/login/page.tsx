"use client"
import Link from "next/link";
import { Suspense, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { setUser } from "@/lib/features/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { safeNext } from "@/lib/safeNext";
import { broadcastLogin } from "@/lib/authChannel";
import AuthCard from "@/components/AuthCard";
import TextField from "@/components/ui/TextField";
import Alert from "@/components/ui/Alert";
import { Button, linkClass } from "@/components/ui/Button";

type LoginFields = {
  email: string;
  password: string;
};

type LoginSuccessResponse = {
  data: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    avatar: string;
    bio: string;
    role: string;
    created_at: string;
  };
  message: string;
};

/**
 * `?next=` exists for the invite flow: an invitee arrives logged out and must come back to that
 * exact link. It goes through `safeNext`, since an unchecked redirect target is an open redirect.
 */
function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  // Set by signup, which hands over here instead of pausing on its own success message.
  const justSignedUp = searchParams.get("created") === "1";

  const [errors, setErrors] = useState<Partial<Record<keyof LoginFields, string[]>>>({});
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  // Keeps the button busy while the next page loads, so a second click can't resubmit.
  const [redirecting, setRedirecting] = useState(false);

  const [form, setForm] = useState<LoginFields>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setLoginError("");

    try {
      const response = await axios.post<LoginSuccessResponse>("/api/auth/login", form);
      dispatch(setUser(response.data.data));
      broadcastLogin(response.data.data.id);
      setRedirecting(true);
      router.replace(next);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 422) {
          setErrors(error.response.data.errors);
        } else if (error.response?.status === 401) {
          setLoginError(error.response.data.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard eyebrow="Sign in" title="Log in to Chattrix" description="Ask your company's policies and get cited answers.">
      {justSignedUp && <Alert tone="success">Account created. Log in to continue — we&apos;ve emailed you a verification link.</Alert>}
      {loginError && <Alert tone="error">{loginError}</Alert>}

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <TextField
          name="email"
          type="email"
          label="Email address"
          value={form.email}
          onChange={handleChange}
          error={errors.email?.[0]}
          autoComplete="username"
          required
          autoFocus
        />

        <TextField
          name="password"
          type="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          error={errors.password?.[0]}
          autoComplete="current-password"
          required
        />

        <Button type="submit" fullWidth loading={loading || redirecting}>
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <hr className="border-hairline" />

      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className={linkClass}>
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}

export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
