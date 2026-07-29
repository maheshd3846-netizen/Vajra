import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublicPortfolioAction } from "@/app/actions/portfolio";
import type { PublicPortfolioData } from "@/components/portfolio/PortfolioThemeWrapper";
import AuroraTheme from "@/components/portfolio/themes/AuroraTheme";
import MinimalTheme from "@/components/portfolio/themes/MinimalTheme";
import CyberTheme from "@/components/portfolio/themes/CyberTheme";
import ProfessionalTheme from "@/components/portfolio/themes/ProfessionalTheme";
import CreativeTheme from "@/components/portfolio/themes/CreativeTheme";

export const dynamic = "force-dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicPortfolioProps {
  params: Promise<{ username: string }>;
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PublicPortfolioProps): Promise<Metadata> {
  const { username } = await params;
  const res = await getPublicPortfolioAction(username);

  if (!res.success || !res.data) {
    return {
      title: "Portfolio Not Found — VAJRA",
      description: "This developer portfolio has not been published yet.",
    };
  }

  const { generatedContent, student } = res.data;
  const content = generatedContent?.content;

  const seoTitle =
    content?.seoTitle || `${student.fullName} — Developer Portfolio | VAJRA`;
  const seoDescription =
    content?.seoDescription ||
    `Portfolio of ${student.fullName}, ${student.major || "Software Engineer"} at ${student.university || "Institute of Technology"}.`;
  const ogDescription =
    content?.socialSharingDescription || seoDescription;

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: ogDescription,
      type: "profile",
      url: `/p/${username}`,
      siteName: "VAJRA AI Career Intelligence",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: ogDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: student.fullName,
        jobTitle: student.major || "Software Engineer",
        alumniOf: student.university || undefined,
        url: `/p/${username}`,
        sameAs: [
          student.githubUrl,
          student.linkedinUrl,
        ].filter(Boolean),
      }),
    },
  };
}

// ─── Not Found Component ──────────────────────────────────────────────────────

function PortfolioNotFound({ username }: { username: string }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-6">
        <div className="h-20 w-20 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center text-4xl mx-auto">
          🔍
        </div>
        <h1 className="text-2xl font-bold text-white">Portfolio Not Found</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          The developer portfolio at{" "}
          <span className="text-white font-mono">/p/{username}</span> has not
          been published yet, or the URL may have changed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          ← Go to VAJRA
        </Link>
      </div>
    </div>
  );
}

// ─── Theme Router ─────────────────────────────────────────────────────────────

function renderTheme(data: PublicPortfolioData) {
  const theme = data.generatedContent?.theme || "aurora";

  switch (theme) {
    case "minimal":
      return <MinimalTheme data={data} />;
    case "cyber":
      return <CyberTheme data={data} />;
    case "professional":
      return <ProfessionalTheme data={data} />;
    case "creative":
      return <CreativeTheme data={data} />;
    case "aurora":
    default:
      return <AuroraTheme data={data} />;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PublicPortfolioViewPage({
  params,
}: PublicPortfolioProps) {
  const { username } = await params;
  const res = await getPublicPortfolioAction(username);

  if (!res.success || !res.data) {
    return <PortfolioNotFound username={username} />;
  }

  // Type-align the action response to the theme component's expected shape
  const data: PublicPortfolioData = {
    title: res.data.title,
    description: res.data.description,
    slug: res.data.slug,
    generatedContent: res.data.generatedContent,
    student: res.data.student,
    skills: res.data.skills,
    projects: res.data.projects,
    certificates: res.data.certificates,
    resumes: res.data.resumes,
    careerTimeline: res.data.careerTimeline,
    careerDna: res.data.careerDna,
  };

  return renderTheme(data);
}
