import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin navigation and sidebar will be added here */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
