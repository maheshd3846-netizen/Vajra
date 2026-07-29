/**
 * VAJRA AI Company Trust Score & Verification Engine
 * 
 * Evaluates company profiles, verification metrics, domain validity,
 * past hiring activity, and generates explainable Trust Scores & Status Badges.
 */

export type CompanyVerificationStatus = "verified" | "pending" | "blacklisted";

export interface CompanyDataInput {
  id?: string;
  name: string;
  website?: string | null;
  industry?: string | null;
  logo_url?: string | null;
  description?: string | null;
  is_verified?: boolean;
  verification_status?: CompanyVerificationStatus | string | null;
  gst_number?: string | null;
  official_email?: string | null;
  registration_doc_url?: string | null;
  internships_posted_count?: number;
  response_rate_percent?: number;
}

export interface TrustScoreBreakdownItem {
  dimension: string;
  score: number;
  maxScore: number;
  explanation: string;
  passed: boolean;
}

export interface CompanyTrustScoreResult {
  trustScore: number; // 0 to 100
  status: CompanyVerificationStatus;
  badgeLabel: string;
  badgeColorClass: {
    bg: string;
    border: string;
    text: string;
    dot: string;
  };
  breakdown: TrustScoreBreakdownItem[];
  canPublishInternships: boolean;
  canReceiveApplications: boolean;
  isEmployerDashboardAccessible: boolean;
  summaryExplanation: string;
}

/**
 * Normalizes verification status from boolean is_verified and verification_status string
 */
export function getCompanyVerificationStatus(data: CompanyDataInput): CompanyVerificationStatus {
  if (data.verification_status === "blacklisted") {
    return "blacklisted";
  }
  if (data.verification_status === "verified" || data.is_verified === true) {
    return "verified";
  }
  return "pending";
}

/**
 * Calculates AI Company Trust Score & generates explainable breakdown
 */
export function calculateCompanyTrustScore(data: CompanyDataInput): CompanyTrustScoreResult {
  const status = getCompanyVerificationStatus(data);

  // Dimension 1: Verification Status (40 points)
  let statusScore = 10;
  let statusExplanation = "Company is pending administrative verification.";
  if (status === "verified") {
    statusScore = 40;
    statusExplanation = "Verified corporate identity confirmed by VAJRA administrators.";
  } else if (status === "blacklisted") {
    statusScore = 0;
    statusExplanation = "Company has been blacklisted due to policy violation or scam reports.";
  }

  // Dimension 2: Profile Completion (20 points)
  let profilePoints = 0;
  if (data.name && data.name.trim().length > 2) profilePoints += 5;
  if (data.description && data.description.trim().length > 30) profilePoints += 5;
  if (data.logo_url) profilePoints += 5;
  if (data.industry) profilePoints += 5;

  const profileExplanation = profilePoints === 20
    ? "Complete corporate profile with logo, description, and industry details."
    : `Partial corporate profile (${profilePoints}/20 pts). Add description & logo to improve trust score.`;

  // Dimension 3: Official Web Domain & Corporate Email (20 points)
  let domainPoints = 0;
  let domainExplanation = "Missing website or official domain credentials.";

  if (data.website && (data.website.startsWith("http://") || data.website.startsWith("https://") || data.website.includes("."))) {
    domainPoints += 10;
    domainExplanation = `Verified website domain (${data.website}).`;
  }

  if (data.official_email && data.official_email.includes("@") && !data.official_email.endsWith("@gmail.com") && !data.official_email.endsWith("@yahoo.com")) {
    domainPoints += 10;
    domainExplanation += " Corporate domain email address verified.";
  } else if (data.official_email) {
    domainPoints += 5;
    domainExplanation += " Email on file (generic domain).";
  }

  // Dimension 4: Hiring Activity & Track Record (10 points)
  const internshipCount = data.internships_posted_count ?? 1;
  const hiringPoints = Math.min(10, Math.max(5, internshipCount * 2));
  const hiringExplanation = `${internshipCount} active internship listing(s) posted on platform.`;

  // Dimension 5: Response Rate & Recruiter Activity (10 points)
  const responseRate = data.response_rate_percent ?? 90;
  const responsePoints = Math.round((responseRate / 100) * 10);
  const responseExplanation = `Candidate response rate of ${responseRate}%.`;

  // Total Score (0 - 100)
  const rawScore = statusScore + profilePoints + domainPoints + hiringPoints + responsePoints;
  const trustScore = Math.max(0, Math.min(100, status === "blacklisted" ? 0 : rawScore));

  const breakdown: TrustScoreBreakdownItem[] = [
    {
      dimension: "Admin Verification",
      score: statusScore,
      maxScore: 40,
      explanation: statusExplanation,
      passed: status === "verified",
    },
    {
      dimension: "Profile Completion",
      score: profilePoints,
      maxScore: 20,
      explanation: profileExplanation,
      passed: profilePoints >= 15,
    },
    {
      dimension: "Domain & Email Validity",
      score: domainPoints,
      maxScore: 20,
      explanation: domainExplanation,
      passed: domainPoints >= 10,
    },
    {
      dimension: "Hiring History",
      score: hiringPoints,
      maxScore: 10,
      explanation: hiringExplanation,
      passed: hiringPoints >= 5,
    },
    {
      dimension: "Response Rate",
      score: responsePoints,
      maxScore: 10,
      explanation: responseExplanation,
      passed: responsePoints >= 7,
    },
  ];

  // Permissions & Badge metadata
  let badgeLabel = "Pending Verification";
  let badgeColorClass = {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
  };
  let canPublishInternships = false;
  let canReceiveApplications = false;
  let isEmployerDashboardAccessible = true;
  let summaryExplanation = "This company is currently pending admin verification. Internship publishing is restricted until identity review completes.";

  if (status === "verified") {
    badgeLabel = "Verified Partner";
    badgeColorClass = {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
    };
    canPublishInternships = true;
    canReceiveApplications = true;
    isEmployerDashboardAccessible = true;
    summaryExplanation = "Vetted corporate partner with verified identity credentials. Authorized to post internships and hire candidates.";
  } else if (status === "blacklisted") {
    badgeLabel = "Blacklisted";
    badgeColorClass = {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-400",
      dot: "bg-red-500",
    };
    canPublishInternships = false;
    canReceiveApplications = false;
    isEmployerDashboardAccessible = false;
    summaryExplanation = "This organization has been blacklisted by platform administration due to security violations. Employer dashboard access and active listings are suspended.";
  }

  return {
    trustScore,
    status,
    badgeLabel,
    badgeColorClass,
    breakdown,
    canPublishInternships,
    canReceiveApplications,
    isEmployerDashboardAccessible,
    summaryExplanation,
  };
}
