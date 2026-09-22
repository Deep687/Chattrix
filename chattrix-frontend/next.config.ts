import os from "node:os";
import type { NextConfig } from "next";

/**
 * Hosts allowed to request dev-only assets: every non-internal IPv4 this machine holds, its
 * hostname, and anything named in `DEV_ORIGINS`.
 *
 * Hardcoding a LAN IP breaks silently every time DHCP hands out a new one — Next blocks
 * `/_next/*`, the page loads but never hydrates, and forms fall back to a native GET submit,
 * which reads as "the button does nothing" rather than a config error. Detecting the addresses
 * at startup keeps the list from going stale on any machine.
 *
 * Detection only sees local interfaces, so a tunnel (ngrok, Cloudflare, Tailscale) or a
 * container reached on the host's address needs `DEV_ORIGINS` — a comma-separated list.
 * Ignored outside `next dev`.
 */
function devOrigins(): string[] {
    const interfaces = Object.values(os.networkInterfaces())
        .flat()
        .filter((details) => details?.family === "IPv4" && !details.internal)
        .map((details) => details!.address);

    const extra = (process.env.DEV_ORIGINS ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    return [...new Set([...interfaces, os.hostname(), ...extra])];
}

const nextConfig: NextConfig = {
    allowedDevOrigins: devOrigins(),
};

export default nextConfig;
