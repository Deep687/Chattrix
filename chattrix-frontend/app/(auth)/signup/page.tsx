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
 setErrors({});

  try {
    const response = await axios.post('/api/auth/signup', form);

    setSuccessMessage('Account created successfully! Redirecting to login...');

    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      setErrors(error.response.data.errors);
    } else {
      console.error(error);
    }
  }

}
  return (
    <div className="min-h-screen bg-[#0c0808] text-[#f0eded] flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-[#1a1a1a] rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Create an account
          </h1>
          <p className="mt-2 text-[#9a8e8e]">
            Already have an account?{" "}
            <Link href="/login" className="text-red-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>
        {successMessage && (
          <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">{successMessage}</div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="text-sm font-medium text-[#9a8e8e]">Name</label>
            <input value={form.name} onChange={handleChange} id="name" name="name" type="text" required className="mt-1 block w-full px-3 py-2 bg-[#0c0808] border border-white/15 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500" />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name[0]}</p>}
          </div>
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
           <div>
            <label htmlFor="password_confirmation" className="text-sm font-medium text-[#9a8e8e]">Confirm Password</label>
            <input value={form.password_confirmation} onChange={handleChange} id="password_confirmation" name="password_confirmation" type="password" autoComplete="new-password" required className="mt-1 block w-full px-3 py-2 bg-[#0c0808] border border-white/15 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500" />
            {errors.password_confirmation && <p className="mt-1 text-sm text-red-500">{errors.password_confirmation[0]}</p>}
          </div>
          <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-red-700 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}