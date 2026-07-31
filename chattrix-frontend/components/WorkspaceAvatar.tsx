import { assetUrl } from "@/lib/api";

type WorkspaceAvatarProps = {
    avatar: string | null;
    /** `sm` for the sidebar, `md` for list rows, `lg` for the detail header. */
    size?: "sm" | "md" | "lg";
};

const SIZES = {
    sm: "size-6 rounded-md text-[0.7rem]",
    md: "size-11 rounded-lg text-base",
    lg: "size-16 rounded-xl text-2xl",
} as const;

/**
 * A workspace's uploaded avatar, or the ⬡ glyph when it has none.
 *
 * Extracted rather than duplicated: the listing, the detail header, and the sidebar all need it,
 * and the fallback is the part that drifts — a workspace with no avatar rendering as a blank box
 * in one place and a glyph in another reads as a bug rather than a style choice.
 *
 * `alt` is deliberately empty. The avatar always sits beside the workspace name, so describing it
 * again would make a screen reader announce the name twice.
 */
export default function WorkspaceAvatar({ avatar, size = "md" }: WorkspaceAvatarProps) {
    const box = SIZES[size];

    if (avatar) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={assetUrl(avatar)}
                alt=""
                className={`${box} object-cover border border-white/10 shrink-0`}
            />
        );
    }

    return (
        <div
            aria-hidden="true"
            className={`${box} bg-surface border border-white/10 grid place-items-center text-brand shrink-0`}
        >
            ⬡
        </div>
    );
}
