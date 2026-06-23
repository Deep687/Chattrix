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
      dispatch(clearUser());
      router.push("/login");
    } catch {
      dispatch(clearUser());
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[#0c0808]/90 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

        <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold tracking-tight">
          Chatt<span className="text-red-500">rix</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">
              {user.name}
            </span>

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
              className="text-sm bg-red-700 hover:bg-red-600 px-4 py-1.5 rounded-lg font-semibold transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}

      </div>
    </header>
  );
}