import React from "react";

// Individual Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border/40 overflow-hidden flex flex-col space-y-4 animate-pulse">
      <div className="aspect-[4/5] bg-muted w-full"></div>
      <div className="p-4 space-y-3 flex-grow">
        <div className="h-3 bg-muted rounded-none w-1/4"></div>
        <div className="h-4 bg-muted rounded-none w-3/4"></div>
        <div className="h-4 bg-muted rounded-none w-1/3 pt-2"></div>
      </div>
    </div>
  );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

// Product Detail Page Skeleton
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left image gallery skeleton */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-muted w-full"></div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="aspect-square bg-muted"></div>
            ))}
          </div>
        </div>

        {/* Right info details skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 bg-muted w-1/5"></div>
            <div className="h-8 bg-muted w-3/4"></div>
            <div className="h-4 bg-muted w-1/4 pt-2"></div>
          </div>
          <div className="h-24 bg-muted w-full"></div>
          <div className="space-y-2">
            <div className="h-10 bg-muted w-full"></div>
            <div className="h-10 bg-muted w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
