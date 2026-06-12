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

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
};


const handleSubmit=async(  e: React.FormEvent<HTMLFormElement>)=>{
 e.preventDefault();
 setLoading(true);
 setErrors({});
 setLoginError('');
 
  try {
    const response = await axios.post<LoginSuccessResponse>('/api/auth/login', form);

    dispatch(setUser(response.data.data));
    setSuccessMessage('Logged in successfully! Redirecting to dashboard...');

    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);

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
    <div className="min-h-screen bg-[#0c0808] text-[#f0eded] flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#1a1a1a] rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Log in to your account
          </h1>
          <p className="mt-2 text-[#9a8e8e]">
            New to Chattrix?{" "}
            <Link href="/signup" className="text-red-500 hover:underline">
             Sign up
            </Link>
          </p>
        </div>
        {successMessage && (
          <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">{successMessage}</div>
        )}
        {loginError && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{loginError}</div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-[#9a8e8e]">Email address</label>
            <input value={form.email} onChange={handleChange} id="email" name="email" type="email" autoComplete="email" required className="mt-1 block w-full px-3 py-2 bg-[#0c0808] border border-white/15 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500" />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email[0]}</p>}
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-[#9a8e8e]">Password</label>
            <input value={form.password} onChange={handleChange} id="password" name="password" type="password" autoComplete="new-password" required className="mt-1 block w-full px-3 py-2 bg-[#0c0808] border border-white/15 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500" />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password[0]}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-red-700 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}