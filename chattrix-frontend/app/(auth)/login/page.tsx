"use client"
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { setUser } from "@/lib/features/userSlice";
import { useAppDispatch } from "@/lib/hooks";

export default function Login() {
const router = useRouter();
const dispatch = useAppDispatch();
type LoginForm = {
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
}

const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string[]>>>({});
const [loginError, setLoginError] = useState('');
const [loading, setLoading] = useState(false);
const [successMessage, setSuccessMessage] = useState('');

const [form, setForm] = useState<LoginForm>({
  email: "",
  password: "",
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setErrors({});
  setLoginError('');

  try {
    const response = await axios.post<LoginSuccessResponse>('/api/auth/login', form);
    dispatch(setUser(response.data.data));
    setSuccessMessage('Logged in successfully! Redirecting…');
    setTimeout(() => router.push('/dashboard'), 2000);
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
}

  return (
      <div className="w-full max-w-md p-8 bg-overlay rounded-xl border border-white/5 shadow-xl space-y-7">

        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Log in to Chattrix</h1>
          <p className="mt-2 text-dim text-sm">
            New here?{" "}
            <Link href="/signup" className="text-red-400 hover:text-red-300 transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        {successMessage && (
          <div className="px-4 py-3 text-sm text-green-400 bg-green-950/50 border border-green-900 rounded-lg" role="alert">
            {successMessage}
          </div>
        )}
        {loginError && (
          <div className="px-4 py-3 text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg" role="alert">
            {loginError}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-dim mb-1.5">
              Email address
            </label>
            <input
              value={form.email}
              onChange={handleChange}
              id="email" name="email" type="email" autoComplete="email" required
              className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email[0]}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-dim mb-1.5">
              Password
            </label>
            <input
              value={form.password}
              onChange={handleChange}
              id="password" name="password" type="password" autoComplete="current-password" required
              className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
            />
            {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password[0]}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-overlay transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

      </div>
  );
}
