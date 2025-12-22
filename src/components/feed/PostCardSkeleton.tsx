import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PostCardSkeleton() {
  return (
    <Card className="p-4 border-x-0 border-t-0 rounded-none">
      <div className="flex gap-3">
        {/* Avatar */}
        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />

        <div className="flex-1 space-y-3">
          {/* Header - name and username */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Image placeholder (sometimes) */}
          {Math.random() > 0.5 && (
            <Skeleton className="h-64 w-full rounded-2xl mt-3" />
          )}

          {/* Engagement buttons */}
          <div className="flex items-center gap-12 mt-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function FeedLoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
