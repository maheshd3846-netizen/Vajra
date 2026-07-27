import React from "react";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Mentor navigation and sidebar will be added here */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
