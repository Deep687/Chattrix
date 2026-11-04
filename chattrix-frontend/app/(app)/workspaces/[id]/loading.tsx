import Skeleton from "@/components/ui/Skeleton";

/** Mirrors the workspace page's layout while its three requests are in flight. */
export default function Loading() {
    return (
        <div role="status" aria-label="Loading workspace" className="flex flex-col items-start gap-6 lg:flex-row">
            <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
                <div className="overflow-hidden rounded-card border border-hairline bg-surface">
                    <div className="ruled h-28 border-b border-hairline" />
                    <div className="flex flex-col gap-3 px-8 pb-8 pt-6">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-10 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                <div className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-8">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-7 w-1/2" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
            <div className="flex w-full flex-col gap-4 rounded-card border border-hairline bg-surface p-6 lg:w-80">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
            </div>
        </div>
    );
}
