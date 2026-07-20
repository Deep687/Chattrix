"use client"

export default function PostsFeed({ slug }: { slug: string }) {
    return (
        <div className="bg-overlay rounded-xl border border-white/5 px-8 py-12 text-center">
            <p className="text-dim text-sm">Posts are coming soon.</p>
            <p className="mt-1 text-fade text-xs">Anything shared in /h/{slug} will show up here.</p>
        </div>
    );
}
