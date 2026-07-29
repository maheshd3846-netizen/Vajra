import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-pulse p-4">
      {/* Welcome Hero Skeleton & Score dials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Welcome Hero / Readiness Status card */}
        <div className="glass-card lg:col-span-7 rounded-2xl border-border/70 p-6 min-h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 w-48 rounded-lg bg-muted/80" />
                <div className="h-4 w-32 rounded-lg bg-muted/70" />
              </div>
              <div className="h-6 w-24 rounded-lg bg-muted/80" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-4">
              <div className="sm:col-span-4 flex justify-center">
                <div className="h-28 w-28 rounded-full border-4 border-background bg-muted/80" />
              </div>
              <div className="sm:col-span-8 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 rounded bg-muted/80" />
                      <div className="h-3 w-8 rounded bg-muted/80" />
                    </div>
                    <div className="h-2 w-full rounded bg-background/70" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-4 border-t border-border/70 pt-4">
            <div className="h-10 flex-1 rounded-xl bg-muted/80" />
            <div className="h-10 flex-1 rounded-xl bg-muted/80" />
          </div>
        </div>

        {/* Skill Passport Matrix Skeleton */}
        <div className="glass-card lg:col-span-5 rounded-2xl border-border/70 p-6 min-h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <div className="h-4 w-36 rounded bg-muted/80" />
              <div className="h-3 w-20 rounded bg-muted/70" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="h-4 w-20 rounded bg-muted/80" />
                      <div className="h-4 w-12 rounded bg-muted/70" />
                    </div>
                    <div className="h-2 w-full rounded bg-background/70" />
                  </div>
                  <div className="h-4 w-12 rounded bg-muted/80" />
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto mt-4 h-4 w-32 rounded bg-muted/70" />
        </div>
      </div>

      {/* AI Coach Action Items Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-48 rounded bg-muted/80" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card min-h-[170px] flex flex-col justify-between rounded-2xl border-border/70 p-5">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-muted/70" />
                <div className="h-4 w-28 rounded bg-muted/80" />
                <div className="h-10 w-full rounded-lg bg-background/70" />
              </div>
              <div className="h-8 w-full rounded-xl bg-muted/80" />
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities & Timeline Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="glass-card lg:col-span-7 rounded-2xl border-border/70 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/70">
            <div className="h-4 w-40 rounded bg-muted/80" />
            <div className="h-3 w-24 rounded bg-muted/70" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 p-4">
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-muted/80" />
                  <div className="h-3 w-48 rounded bg-muted/70" />
                </div>
                <div className="h-8 w-20 rounded-lg bg-muted/80" />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card lg:col-span-5 flex flex-col justify-between rounded-2xl border-border/70 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/70">
              <div className="h-4 w-32 rounded bg-muted/80" />
              <div className="h-3 w-16 rounded bg-muted/70" />
            </div>
            <div className="ml-2 space-y-5 border-l border-border/70 pl-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3.5 w-44 rounded bg-muted/80" />
                  <div className="h-3 w-16 rounded bg-muted/70" />
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto mt-4 h-4 w-36 rounded bg-muted/70" />
        </div>
      </div>
    </div>
  );
}
