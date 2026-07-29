import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
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
  const themeInitScript = `
    (function () {
      try {
        var storageKey = "vajra-theme";
        var savedTheme = localStorage.getItem(storageKey) || "system";
        var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        var resolvedTheme = savedTheme === "system" ? systemTheme : savedTheme;
        var root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(resolvedTheme === "dark" ? "dark" : "light");
        root.style.colorScheme = resolvedTheme;
        root.dataset.theme = savedTheme;
      } catch (error) {}
    })();
  `;

  return (
<<<<<<< HEAD
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased min-h-screen bg-background text-foreground`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              theme="system"
              position="bottom-right"
              toastOptions={{
                className: "glass-card border-border/80 shadow-2xl",
                style: {
                  fontSize: "12px",
                  borderRadius: "16px",
                  backdropFilter: "blur(16px)",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
=======
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
>>>>>>> 03665dce1bbee32c9280c9884c4aaee70d7fbd2f
      </body>
    </html>
  );
}
