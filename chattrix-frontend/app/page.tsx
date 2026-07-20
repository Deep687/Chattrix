"use client"
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAppSelector } from "@/lib/hooks";

const features = [
  {
    symbol: "⬡",
    title: "Hubs",
    desc: "Join or create hubs around any topic — tech, gaming, art, local events, and more.",
  },
  {
    symbol: "◎",
    title: "Conversations",
    desc: "Post, comment, and upvote. Real discussions with people who actually care.",
  },
  {
    symbol: "✦",
    title: "AI Insights",
    desc: "Smart summaries, semantic search, and moderation assistance — coming soon.",
  },
];

export default function Home() {
  const user = useAppSelector((state) => state.user.data);

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-7 rounded-full border border-white/10 text-xs text-dim">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
          Early access
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 max-w-2xl leading-tight">
          Find your people.<br className="hidden sm:block" /> Join the conversation.
        </h1>
        <p className="text-dim text-base sm:text-lg max-w-md mb-10 leading-relaxed">
          Chattrix brings together hubs around the topics that matter to you — share, discuss, and discover.
        </p>

        {user ? (
          <Link
            href="/dashboard"
            className="bg-red-600 hover:bg-red-500 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Go to your feed →
          </Link>
        ) : (
          <Link
            href="/signup"
            className="bg-red-600 hover:bg-red-500 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Create account
          </Link>
        )}
      </section>

      {/* Feature strip */}
      <section className="max-w-4xl mx-auto w-full px-6 pb-20 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.map((f) => (
          <div key={f.title} className="bg-overlay rounded-xl p-6 border border-white/5">
            <span className="text-red-500 text-xl mb-3 block">{f.symbol}</span>
            <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
            <p className="text-dim text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 py-5">
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-fade">
          {["Help", "About", "Careers", "Privacy", "Terms"].map((item) => (
            <Link key={item} href="#" className="hover:text-dim transition-colors">
              {item}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
