"use client";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearUser } from "@/lib/features/userSlice";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Navbar() {
  const user = useAppSelector((state) => state.user.data);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } finally {
      dispatch(clearUser());
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-surface/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold tracking-tight">
          Chatt<span className="text-brand">rix</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-dim">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm border border-white/15 hover:border-white/30 px-4 py-1.5 rounded-lg transition-colors"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm border border-white/15 hover:border-white/30 px-4 py-1.5 rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-brand hover:bg-red-600 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}

      </div>
    </header>
  );
}
