import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white p-6 font-sans animate-fadeIn">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-48 rounded-3xl" />
        <Skeleton className="h-48 rounded-3xl" />
        <Skeleton className="h-48 rounded-3xl" />
      </div>

      {/* Large Content Skeleton */}
      <Skeleton className="h-80 rounded-3xl w-full" />
    </div>
  );
}
