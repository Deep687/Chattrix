/** Stroke paths on a 24-unit grid. Decorative: always hidden from assistive tech. */
const PATHS = {
    workspace: "M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M3 21h18M8 7h4M8 11h4M8 15h4",
    document: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4",
    upload: "M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3",
    ask: "M4 5h16v11H9l-5 4zM9 10h6",
    send: "M5 12h14M13 6l6 6-6 6",
    members: "M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM22 19v-1a4 4 0 0 0-3-3.87M16 4.13a3 3 0 0 1 0 5.74",
    mail: "M3 6h18v12H3zM3 7l9 6 9-6",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
    shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z",
    quote: "M7 7h4v4c0 2.5-1.5 4-4 5M15 7h4v4c0 2.5-1.5 4-4 5",
    question: "M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
    lock: "M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3",
    audit: "M7 3h10v18H7zM10 8h4M10 12h4M10 16h2",
    check: "M5 12.5l4.5 4.5L19 7.5",
    close: "M6 6l12 12M18 6L6 18",
    menu: "M4 6h16M4 12h16M4 18h16",
    chevron: "M6 9l6 6 6-6",
    plus: "M12 5v14M5 12h14",
    edit: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
    trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
    logout: "M15 17l5-5-5-5M20 12H9M12 21H5V3h7",
    sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z",
    arrow: "M5 12h14M13 6l6 6-6 6",
    clock: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 ${className}`}
        >
            <path d={PATHS[name]} />
        </svg>
    );
}
