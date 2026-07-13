"use client"
import Link from "next/link";
import { useAppSelector } from "@/lib/hooks";
import { assetUrl } from "@/lib/api";

export default function Dashboard() {
  const user = useAppSelector((state) => state.user.data);
  const firstName = user?.name?.split(' ')[0] ?? '';

  const myHubs = useAppSelector((state) => state.hubs);

  const hasHubs = myHubs.owned.length > 0 || myHubs.joined.length > 0;

  if (!hasHubs) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {myHubs.owned.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-dim uppercase tracking-wider mb-3">Hubs you created</h2>
          <ul className="space-y-2">
            {myHubs.owned.map((hub) => (
              <li key={hub.id}>
                <Link
                  href={`/hub/${hub.slug}`}
                  className="flex items-center gap-3 bg-overlay rounded-xl border border-white/5 px-5 py-4 hover:border-white/10 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-surface overflow-hidden flex items-center justify-center shrink-0">
                    {hub.avatar ? (
                      <img src={assetUrl(hub.avatar)} alt={hub.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-ink">{hub.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{hub.name}</p>
                    {hub.description && <p className="text-dim text-sm mt-1 truncate">{hub.description}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {myHubs.joined.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-dim uppercase tracking-wider mb-3">Hubs you joined</h2>
          <ul className="space-y-2">
            {myHubs.joined.map((hub) => (
              <li key={hub.id}>
                <Link
                  href={`/hub/${hub.slug}`}
                  className="flex items-center gap-3 bg-overlay rounded-xl border border-white/5 px-5 py-4 hover:border-white/10 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-surface overflow-hidden flex items-center justify-center shrink-0">
                    {hub.avatar ? (
                      <img src={assetUrl(hub.avatar)} alt={hub.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-ink">{hub.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{hub.name}</p>
                    {hub.description && <p className="text-dim text-sm mt-1 truncate">{hub.description}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
