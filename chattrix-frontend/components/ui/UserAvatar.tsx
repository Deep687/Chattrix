import { assetUrl } from "@/lib/api";

const SIZES = {
    sm: "size-7 text-sm",
    md: "size-9 text-base",
    lg: "size-20 text-4xl",
} as const;

/** A person's photo, or their serif initial. `alt` is empty: the name always sits beside it. */
export default function UserAvatar({ name, avatar, size = "md" }: { name: string; avatar?: string | null; size?: keyof typeof SIZES }) {
    const box = `${SIZES[size]} shrink-0 rounded-full`;

    if (avatar) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={assetUrl(avatar)} alt="" className={`${box} object-cover ring-1 ring-hairline`} />;
    }

    return (
        <span aria-hidden="true" className={`${box} inline-flex items-center justify-center bg-surface-muted font-serif font-semibold text-brand-ink italic ring-1 ring-hairline`}>
            {name.charAt(0).toUpperCase()}
        </span>
    );
}
