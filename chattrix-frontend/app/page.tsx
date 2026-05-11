import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0c0808] text-[#f0eded]">
      <Navbar />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-40 pb-24">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          The front page of the internet
        </h1>
        <p className="text-[#9a8e8e] text-base max-w-md mb-10">
          Discover communities, share ideas, and explore what the world is talking about.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/signup"
            className="bg-red-700 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="border border-white/15 hover:border-white/30 text-[#f0eded] px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Footer links */}
      <footer className="fixed bottom-0 w-full border-t border-white/5 bg-[#0c0808] py-4">
        <div className="flex items-center justify-center gap-6 text-xs text-[#6b5f5f]">
          {["Help", "About", "Careers", "Privacy", "Terms"].map((item) => (
            <Link key={item} href="#" className="hover:text-[#9a8e8e] transition-colors">
              {item}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
