import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-pulse p-4">
      {/* Welcome Hero Skeleton & Score dials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Welcome Hero / Readiness Status card */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-white/5 rounded-2xl p-6 min-h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-slate-800 rounded-lg" />
                <div className="h-4 w-32 bg-slate-800/80 rounded-lg" />
              </div>
              <div className="h-6 w-24 bg-slate-800 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-4">
              <div className="sm:col-span-4 flex justify-center">
                <div className="h-28 w-28 rounded-full bg-slate-800 border-4 border-slate-900" />
              </div>
              <div className="sm:col-span-8 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 bg-slate-800 rounded" />
                      <div className="h-3 w-8 bg-slate-800 rounded" />
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-6 pt-4 border-t border-white/5">
            <div className="h-10 flex-1 bg-slate-800 rounded-xl" />
            <div className="h-10 flex-1 bg-slate-800 rounded-xl" />
          </div>
        </div>

        {/* Skill Passport Matrix Skeleton */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-white/5 rounded-2xl p-6 min-h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="h-4 w-36 bg-slate-800 rounded" />
              <div className="h-3 w-20 bg-slate-800/60 rounded" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="h-4 w-20 bg-slate-800 rounded" />
                      <div className="h-4 w-12 bg-slate-800/60 rounded" />
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded" />
                  </div>
                  <div className="h-4 w-12 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="h-4 w-32 bg-slate-800/60 rounded mx-auto mt-4" />
        </div>
      </div>

      {/* AI Coach Action Items Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-48 bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 min-h-[170px] flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-800/60 rounded" />
                <div className="h-4 w-28 bg-slate-800 rounded" />
                <div className="h-10 w-full bg-slate-800/40 rounded-lg" />
              </div>
              <div className="h-8 w-full bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities & Timeline Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <div className="h-4 w-40 bg-slate-800 rounded" />
            <div className="h-3 w-24 bg-slate-800/60 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-800 rounded" />
                  <div className="h-3 w-48 bg-slate-800/60 rounded" />
                </div>
                <div className="h-8 w-20 bg-slate-800 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div className="h-4 w-32 bg-slate-800 rounded" />
              <div className="h-3 w-16 bg-slate-800/60 rounded" />
            </div>
            <div className="pl-4 space-y-5 border-l border-white/5 ml-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3.5 w-44 bg-slate-800 rounded" />
                  <div className="h-3 w-16 bg-slate-800/60 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="h-4 w-36 bg-slate-800/60 rounded mx-auto mt-4" />
        </div>
      </div>
    </div>
  );
}
