"use client"
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";

export default function Dashboard() {
  const user = useAppSelector((state) => state.user.data);
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <div className="space-y-6">
      <div className="bg-overlay rounded-xl border border-white/5 px-8 py-10">
        <p className="text-xl font-bold mb-2">
          {firstName ? `Welcome back, ${firstName}.` : 'Welcome.'}
        </p>
        <p className="text-dim text-sm max-w-md leading-relaxed">
          You&apos;re signed in. This is your dashboard — workspaces and the
          knowledge base are coming next.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-overlay rounded-xl border border-white/5 p-6">
          <span className="text-brand text-xl mb-3 block">⬡</span>
          <h3 className="text-sm font-semibold mb-1.5">Workspaces</h3>
          <p className="text-dim text-sm leading-relaxed">
            Create a workspace and invite members. Coming soon.
          </p>
        </div>

        <div className="bg-overlay rounded-xl border border-white/5 p-6">
          <span className="text-brand text-xl mb-3 block">✦</span>
          <h3 className="text-sm font-semibold mb-1.5">Ask your documents</h3>
          <p className="text-dim text-sm leading-relaxed">
            Upload documents and ask questions answered from your workspace. Coming soon.
          </p>
        </div>
      </div>

      <div>
        <Link
          href="/profile"
          className="inline-block bg-brand hover:bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          View profile
        </Link>
      </div>
    </div>
  );
}
