"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { assetUrl } from "@/lib/api";

export default function Sidebar(){
    const pathname = usePathname();
    const { owned, joined } = useAppSelector((state) => state.hubs);
    const myHubs = [...owned, ...joined];

    return(
    <>
    {/* Sidebar */}
    <div className="hidden md:block shrink-0">
        <aside className="flex flex-col gap-0.5">
          {[
            { label: "Home", href: "/dashboard" },
            { label: "Popular", href: "#" },
            { label: "All", href: "/hubs" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-overlay text-ink font-medium"
                  : "text-dim hover:bg-overlay hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/hub/create"
            className="mt-4 block bg-brand hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors text-center"
          >
            Create your hub
          </Link>

          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="px-3 mb-2 text-xs font-semibold text-fade uppercase tracking-wider">
              My Communities
            </p>
            {myHubs.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {myHubs.map((hub) => (
                  <Link
                    key={hub.id}
                    href={`/hub/${hub.slug}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      pathname === `/hub/${hub.slug}`
                        ? "bg-overlay text-ink font-medium"
                        : "text-dim hover:bg-overlay hover:text-ink"
                    }`}
                  >
                    <div className="h-5 w-5 rounded-full bg-surface overflow-hidden flex items-center justify-center shrink-0">
                      {hub.avatar ? (
                        <img src={assetUrl(hub.avatar)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-ink">{hub.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="truncate">{hub.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="px-3 text-xs text-fade leading-relaxed">
                None yet — join one to start seeing posts.
              </p>
            )}
          </div>
        </aside>
    </div>
    </>
    )

}