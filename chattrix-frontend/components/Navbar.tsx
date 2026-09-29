"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearUser } from "@/lib/features/userSlice";
import { broadcastLogout } from "@/lib/authChannel";
import AppLogo from "./AppLogo";
import NavUserMenu from "./NavUserMenu";
import AppearanceMenu from "./AppearanceControls";
import { ButtonLink } from "./ui/Button";
import Icon from "./ui/Icon";

/** The masthead every page shares: wordmark, appearance, account. */
export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const user = useAppSelector((state) => state.user.data);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } finally {
      // In `finally` so a failed logout call still tells the other tabs the cookie is gone.
      broadcastLogout();
      dispatch(clearUser());
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur-sm">
      <div className={`mx-auto flex h-15 w-full items-center gap-3 px-4 sm:px-6 ${onMenuClick ? "" : "max-w-7xl"}`}>
        {user && onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="-ms-1 inline-flex size-9 items-center justify-center rounded-control text-muted motion-safe:transition hover:bg-surface-muted hover:text-ink md:hidden"
          >
            <Icon name="menu" />
          </button>
        )}

        <AppLogo href={user ? "/dashboard" : "/"} />

        <span className="eyebrow ms-3 hidden border-s border-hairline ps-3 lg:inline">Internal policy assistant</span>

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          <AppearanceMenu />

          {user ? (
            <NavUserMenu user={user} onLogout={handleLogout} />
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost">Log in</ButtonLink>
              {/* Wrapped: `buttonClass` sets inline-flex, which would override `hidden`. */}
              <span className="hidden sm:block">
                <ButtonLink href="/signup">Get started</ButtonLink>
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
