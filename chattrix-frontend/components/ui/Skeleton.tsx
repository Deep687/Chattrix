/** A placeholder bar while server data loads. Pulses only when motion is allowed. */
export default function Skeleton({ className = "" }: { className?: string }) {
    return <div aria-hidden="true" className={`rounded-control bg-surface-muted motion-safe:animate-pulse ${className}`} />;
}
