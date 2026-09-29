import Skeleton from "@/components/ui/Skeleton";

/** Shown while the workspace list is fetched on the server, so a click answers immediately. */
export default function Loading() {
    return (
        <div role="status" aria-label="Loading workspaces" className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-4 w-full max-w-lg" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="overflow-hidden rounded-card border border-hairline bg-surface">
                        <div className="ruled h-20 border-b border-hairline" />
                        <div className="flex flex-col gap-3 p-5">
                            <Skeleton className="h-6 w-2/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
