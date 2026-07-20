"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAppSelector } from "@/lib/hooks";
import { assetUrl } from "@/lib/api";

type SuggestedHub = {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  avatar: string | null;
};

export default function Dashboard() {
  const user = useAppSelector((state) => state.user.data);
  const firstName = user?.name?.split(' ')[0] ?? '';

  const myHubs = useAppSelector((state) => state.hubs);

  const hasHubs = myHubs.owned.length > 0 || myHubs.joined.length > 0;

  const [suggested, setSuggested] = useState<SuggestedHub[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);

  useEffect(() => {
    if (hasHubs) return;

    const fetchSuggested = async () => {
      setLoadingSuggested(true);
      try {
        const response = await axios.get('/api/hubs?page=1');
        setSuggested(response.data.data.hubs.slice(0, 3));
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSuggested(false);
      }
    };

    fetchSuggested();
  }, [hasHubs]);

  if (!hasHubs) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="bg-overlay rounded-xl border border-white/5 px-8 py-12 text-center max-w-lg w-full">
          <p className="text-xl font-bold mb-2">
            {firstName ? `Welcome back, ${firstName}.` : 'Welcome to Chattrix.'}
          </p>
          <p className="text-dim text-sm mb-7 max-w-sm mx-auto leading-relaxed">
            Your feed is empty. Join a hub to start seeing posts here.
          </p>
          <Link
            href="/hubs"
            className="inline-block bg-brand hover:bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Browse hubs
          </Link>
        </div>

        {!loadingSuggested && suggested.length > 0 && (
          <div className="max-w-lg w-full">
            <p className="text-xs font-semibold text-dim uppercase tracking-wider mb-3 px-1">
              Suggested for you
            </p>
            <ul className="space-y-2">
              {suggested.map((hub) => (
                <li key={hub.id}>
                  <Link
                    href={`/hub/${hub.slug}`}
                    className="flex items-center gap-3 bg-overlay rounded-xl border border-white/5 px-5 py-4 hover:border-white/10 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-surface ring-1 ring-white/5 overflow-hidden flex items-center justify-center shrink-0">
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
