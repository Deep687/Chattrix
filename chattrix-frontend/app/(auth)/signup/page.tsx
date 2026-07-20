"use client"
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignUpPage() {
const router = useRouter();
type SignUpForm = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type ErrorMessages = Partial<Record<keyof SignUpForm, string[]>>;

const [errors, setErrors] = useState<ErrorMessages>({});
const [successMessage, setSuccessMessage] = useState('');

const [form, setForm] = useState<SignUpForm>({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setErrors({});

  try {
    await axios.post('/api/auth/signup', form);
    setSuccessMessage('Account created! Redirecting to login…');
    setTimeout(() => router.push('/login'), 2000);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      setErrors(error.response.data.errors);
    } else {
      console.error(error);
    }
  }
}

  return (
      <div className="w-full max-w-md p-8 bg-overlay rounded-xl border border-white/5 shadow-xl space-y-7">

        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="mt-2 text-dim text-sm">
            Already have one?{" "}
            <Link href="/login" className="text-red-400 hover:text-red-300 transition-colors">
              Log in
            </Link>
          </p>
        </div>

        {successMessage && (
          <div className="px-4 py-3 text-sm text-green-400 bg-green-950/50 border border-green-900 rounded-lg" role="alert">
            {successMessage}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-dim mb-1.5">Name</label>
            <input
              value={form.name} onChange={handleChange}
              id="name" name="name" type="text" required
              className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
            />
            {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name[0]}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-dim mb-1.5">Email address</label>
            <input
              value={form.email} onChange={handleChange}
              id="email" name="email" type="email" autoComplete="email" required
              className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email[0]}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-dim mb-1.5">Password</label>
            <input
              value={form.password} onChange={handleChange}
              id="password" name="password" type="password" autoComplete="new-password" required
              className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
            />
            {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password[0]}</p>}
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-xs font-medium text-dim mb-1.5">Confirm password</label>
            <input
              value={form.password_confirmation} onChange={handleChange}
              id="password_confirmation" name="password_confirmation" type="password" autoComplete="new-password" required
              className="block w-full px-3 py-2.5 bg-surface border border-white/10 rounded-lg text-sm text-ink placeholder:text-fade focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
            />
            {errors.password_confirmation && <p className="mt-1.5 text-xs text-red-400">{errors.password_confirmation[0]}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-overlay transition-colors"
          >
            Create account
          </button>
        </form>

      </div>
  );
}
