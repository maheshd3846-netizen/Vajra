const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseAnon = createClient(url, key);

async function runTests() {
  console.log("\n--- Testing Supabase Queries with Anon Client ---");

  const tables = [
    { name: 'users', query: () => supabaseAnon.from("users").select("full_name").limit(1) },
    { name: 'student_profiles', query: () => supabaseAnon.from("student_profiles").select("major, university, gpa").limit(1) },
    { name: 'student_skills (with verified)', query: () => supabaseAnon.from("student_skills").select("skill_name, proficiency, verified").limit(1) },
    { name: 'student_skills (WITHOUT verified)', query: () => supabaseAnon.from("student_skills").select("skill_name, proficiency").limit(1) },
    { name: 'projects', query: () => supabaseAnon.from("projects").select("id, title, technologies").limit(1) },
    { name: 'certificates', query: () => supabaseAnon.from("certificates").select("id, name").limit(1) },
    { name: 'resumes', query: () => supabaseAnon.from("resumes").select("id, is_primary").limit(1) },
    { name: 'saved_internships', query: () => supabaseAnon.from("saved_internships").select("internship_id").limit(1) },
    { name: 'internships (with companies join)', query: () => supabaseAnon.from("internships").select(`
        id, company_id, title, description, location, type, requirements, skills_needed, salary_range, status, created_at,
        companies ( name, logo_url, is_verified, verification_status, website, industry, description )
      `).eq("status", "open").order("created_at", { ascending: false }) }
  ];

  for (const t of tables) {
    console.log(`\nTesting table: ${t.name}...`);
    const res = await t.query();
    console.log("Result:", JSON.stringify(res, null, 2));
  }
}

runTests().catch(console.error);
