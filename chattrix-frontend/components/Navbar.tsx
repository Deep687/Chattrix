"use client";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearUser } from "@/lib/features/userSlice";
import { useRouter } from "next/navigation";
import axios from "axios";
import NavUserMenu from "./NavUserMenu";

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
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

        <div className="flex items-center gap-3">
          {user && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open menu"
              className="md:hidden h-8 w-8 -ml-1 flex items-center justify-center rounded-lg text-dim hover:text-ink hover:bg-white/5 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold tracking-tight">
            Chatt<span className="text-brand">rix</span>
          </Link>
        </div>

        {user ? (
          <NavUserMenu user={user} onLogout={handleLogout} />
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
