import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Client = SupabaseClient<any>;

// ==========================================
// 1. Users Helpers
// ==========================================
export async function getUserProfile(client: Client, userId: string) {
  return await client
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
}

export async function updateUserProfile(
  client: Client,
  userId: string,
  updates: Database["public"]["Tables"]["users"]["Update"]
) {
  return await client
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
}

// ==========================================
// 2. Student Profiles Helpers
// ==========================================
export async function getStudentProfile(client: Client, userId: string) {
  return await client
    .from("student_profiles")
    .select("*, users(*)")
    .eq("id", userId)
    .single();
}

export async function updateStudentProfile(
  client: Client,
  userId: string,
  updates: Database["public"]["Tables"]["student_profiles"]["Update"]
) {
  return await client
    .from("student_profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
}

// ==========================================
// 3. Company Helpers
// ==========================================
export async function getCompanyProfile(client: Client, userId: string) {
  return await client
    .from("companies")
    .select("*, users(*)")
    .eq("id", userId)
    .single();
}

export async function updateCompanyProfile(
  client: Client,
  userId: string,
  updates: Database["public"]["Tables"]["companies"]["Update"]
) {
  return await client
    .from("companies")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
}

// ==========================================
// 4. Mentor Helpers
// ==========================================
export async function getMentorProfile(client: Client, userId: string) {
  return await client
    .from("mentors")
    .select("*, users(*)")
    .eq("id", userId)
    .single();
}

export async function updateMentorProfile(
  client: Client,
  userId: string,
  updates: Database["public"]["Tables"]["mentors"]["Update"]
) {
  return await client
    .from("mentors")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
}

// ==========================================
// 5. Internships Helpers
// ==========================================
export async function getInternships(
  client: Client,
  filters?: { companyId?: string; status?: "open" | "closed" }
) {
  let query = client.from("internships").select("*, companies(*)");

  if (filters?.companyId) {
    query = query.eq("company_id", filters.companyId);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  return await query;
}

export async function getInternshipById(client: Client, id: string) {
  return await client
    .from("internships")
    .select("*, companies(*)")
    .eq("id", id)
    .single();
}

export async function createInternship(
  client: Client,
  internship: Database["public"]["Tables"]["internships"]["Insert"]
) {
  return await client
    .from("internships")
    .insert(internship)
    .select()
    .single();
}

// ==========================================
// 6. Applications Helpers
// ==========================================
export async function getApplicationsForStudent(client: Client, studentId: string) {
  return await client
    .from("applications")
    .select("*, internships(*, companies(*))")
    .eq("student_id", studentId);
}

export async function getApplicationsForCompany(client: Client, companyId: string) {
  return await client
    .from("applications")
    .select("*, student_profiles(*, users(*)), internships!inner(*)")
    .eq("internships.company_id", companyId);
}

export async function createApplication(
  client: Client,
  application: Database["public"]["Tables"]["applications"]["Insert"]
) {
  return await client
    .from("applications")
    .insert(application)
    .select()
    .single();
}

export async function updateApplicationStatus(
  client: Client,
  applicationId: string,
  status: Database["public"]["Tables"]["applications"]["Update"]["status"]
) {
  return await client
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .select()
    .single();
}
