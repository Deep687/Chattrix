"use client"
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";

export default function Dashboard() {
  const user = useAppSelector((state) => state.user.data);
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <div className="min-h-screen bg-surface text-ink">
      <Navbar />



      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex gap-6">

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-52 shrink-0 gap-0.5">
          {[
            { label: "Home", href: "/dashboard", active: true },
            { label: "Popular", href: "#", active: false },
            { label: "All", href: "#", active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active
                  ? "bg-overlay text-ink font-medium"
                  : "text-dim hover:bg-overlay hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="px-3 mb-2 text-xs font-semibold text-fade uppercase tracking-wider">
              My Communities
            </p>
            <p className="px-3 text-xs text-fade leading-relaxed">
              None yet — join one to start seeing posts.
            </p>
          </div>
        </aside>

        {/* Feed */}
        <main className="flex-1 min-w-0">
          <div className="bg-overlay rounded-xl border border-white/5 px-8 py-12 text-center">
            <p className="text-xl font-bold mb-2">
              {firstName ? `Welcome back, ${firstName}.` : 'Welcome to Chattrix.'}
            </p>
            <p className="text-dim text-sm mb-7 max-w-sm mx-auto leading-relaxed">
              Your feed is empty. Join a community to start seeing posts here.
            </p>
            <Link
              href="#"
              className="inline-block bg-brand hover:bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Browse communities
            </Link>
          </div>
        </main>

      </div>
    </div>
  );
}
