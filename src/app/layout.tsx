import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "VAJRA — AI Career Intelligence Platform",
    template: "%s | VAJRA AI",
  },
  description:
    "Next-generation AI Career Intelligence Platform empowering student engineers with explainable Career DNA, AI Portfolio Generation, Internship Intelligence, and Adaptive Mock Interviews.",
  keywords: [
    "VAJRA",
    "AI Career Intelligence",
    "Career DNA",
    "Developer Portfolio",
    "Internship Matching",
    "Mock Interview AI",
  ],
  authors: [{ name: "VAJRA Engineering Team" }],
  openGraph: {
    title: "VAJRA — AI Career Intelligence Platform",
    description: "AI Career Operating System for Student Engineers & Enterprise Recruiters",
    siteName: "VAJRA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased min-h-screen bg-[#020617] text-foreground`}>
        <AuthProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                fontSize: "12px",
                borderRadius: "14px",
                backdropFilter: "blur(12px)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
