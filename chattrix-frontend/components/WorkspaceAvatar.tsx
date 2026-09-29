import { assetUrl } from "@/lib/api";
import Icon from "@/components/ui/Icon";

type WorkspaceAvatarProps = {
    avatar: string | null;
    /** When given, the fallback is a serif monogram of it; otherwise the building mark. */
    name?: string;
    /** `sm` for the sidebar, `md` for list rows, `lg` for the detail header. */
    size?: "sm" | "md" | "lg";
};

const SIZES = {
    sm: { box: "size-6 rounded-[0.2rem] text-sm", icon: "size-3.5" },
    md: { box: "size-11 rounded-control text-2xl", icon: "size-5" },
    lg: { box: "size-16 rounded-card text-4xl", icon: "size-7" },
} as const;

/**
 * A workspace's uploaded avatar, or a monogram when it has none. Extracted because the fallback
 * is the part that drifts. `alt` is empty: the name is always beside it.
 */
export default function WorkspaceAvatar({ avatar, name, size = "md" }: WorkspaceAvatarProps) {
    const { box, icon } = SIZES[size];

    if (avatar) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={assetUrl(avatar)} alt="" className={`${box} shrink-0 object-cover ring-1 ring-hairline`} />
        );
    }

    return (
        <span aria-hidden="true" className={`${box} inline-flex shrink-0 items-center justify-center bg-brand font-serif leading-none font-semibold text-on-brand italic`}>
            {name ? name.charAt(0).toUpperCase() : <Icon name="workspace" className={icon} />}
        </span>
    );
}
