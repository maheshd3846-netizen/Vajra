export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: Database["public"]["Enums"]["app_role"]
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: Database["public"]["Enums"]["app_role"]
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: Database["public"]["Enums"]["app_role"]
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      student_profiles: {
        Row: {
          id: string
          bio: string | null
          university: string | null
          major: string | null
          graduation_year: number | null
          gpa: number | null
          github_url: string | null
          linkedin_url: string | null
          degree: string | null
          branch: string | null
          cgpa: number | null
          target_role: string | null
          portfolio_url: string | null
          phone: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          bio?: string | null
          university?: string | null
          major?: string | null
          graduation_year?: number | null
          gpa?: number | null
          github_url?: string | null
          linkedin_url?: string | null
          degree?: string | null
          branch?: string | null
          cgpa?: number | null
          target_role?: string | null
          portfolio_url?: string | null
          phone?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bio?: string | null
          university?: string | null
          major?: string | null
          graduation_year?: number | null
          gpa?: number | null
          github_url?: string | null
          linkedin_url?: string | null
          degree?: string | null
          branch?: string | null
          cgpa?: number | null
          target_role?: string | null
          portfolio_url?: string | null
          phone?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          website: string | null
          industry: string | null
          logo_url: string | null
          description: string | null
          is_verified: boolean
          company_size: string | null
          headquarters: string | null
          contact_email: string | null
          contact_phone: string | null
          hr_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          website?: string | null
          industry?: string | null
          logo_url?: string | null
          description?: string | null
          is_verified?: boolean
          company_size?: string | null
          headquarters?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          hr_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          website?: string | null
          industry?: string | null
          logo_url?: string | null
          description?: string | null
          is_verified?: boolean
          company_size?: string | null
          headquarters?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          hr_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mentors: {
        Row: {
          id: string
          bio: string | null
          company_name: string | null
          job_title: string | null
          expertise: string[]
          linkedin_url: string | null
          is_verified: boolean
          experience: string | null
          skills: string[]
          website_url: string | null
          availability: string | null
          contact_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          bio?: string | null
          company_name?: string | null
          job_title?: string | null
          expertise?: string[]
          linkedin_url?: string | null
          is_verified?: boolean
          experience?: string | null
          skills?: string[]
          website_url?: string | null
          availability?: string | null
          contact_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bio?: string | null
          company_name?: string | null
          job_title?: string | null
          expertise?: string[]
          linkedin_url?: string | null
          is_verified?: boolean
          experience?: string | null
          skills?: string[]
          website_url?: string | null
          availability?: string | null
          contact_email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      internships: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          location: string | null
          type: "remote" | "hybrid" | "on-site"
          requirements: string[]
          skills_needed: string[]
          salary_range: string | null
          status: "pending_approval" | "approved" | "changes_requested" | "rejected" | "suspended" | "archived" | "open" | "closed" | "draft" | "published"
          internship_type: string | null
          duration: string | null
          stipend: string | null
          eligibility: string | null
          deadline: string | null
          openings_count: number
          admin_feedback?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description: string
          location?: string | null
          type: "remote" | "hybrid" | "on-site"
          requirements?: string[]
          skills_needed?: string[]
          salary_range?: string | null
          status?: "pending_approval" | "approved" | "changes_requested" | "rejected" | "suspended" | "archived" | "open" | "closed" | "draft" | "published"
          internship_type?: string | null
          duration?: string | null
          stipend?: string | null
          eligibility?: string | null
          deadline?: string | null
          openings_count?: number
          admin_feedback?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string
          location?: string | null
          type?: "remote" | "hybrid" | "on-site"
          requirements?: string[]
          skills_needed?: string[]
          salary_range?: string | null
          status?: "pending_approval" | "approved" | "changes_requested" | "rejected" | "suspended" | "archived" | "open" | "closed" | "draft" | "published"
          internship_type?: string | null
          duration?: string | null
          stipend?: string | null
          eligibility?: string | null
          deadline?: string | null
          openings_count?: number
          admin_feedback?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          internship_id: string
          student_id: string
          resume_url: string
          cover_letter: string | null
          status: "applied" | "reviewing" | "shortlisted" | "interview_scheduled" | "interviewing" | "selected" | "accepted" | "rejected" | "joined" | "completed" | "withdrawn"
          interview_date?: string | null
          interview_notes?: string | null
          withdrawn_at?: string | null
          applied_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          internship_id: string
          student_id: string
          resume_url: string
          cover_letter?: string | null
          status?: "applied" | "reviewing" | "shortlisted" | "interview_scheduled" | "interviewing" | "selected" | "accepted" | "rejected" | "joined" | "completed" | "withdrawn"
          interview_date?: string | null
          interview_notes?: string | null
          withdrawn_at?: string | null
          applied_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          internship_id?: string
          student_id?: string
          resume_url?: string
          cover_letter?: string | null
          status?: "applied" | "reviewing" | "shortlisted" | "interview_scheduled" | "interviewing" | "selected" | "accepted" | "rejected" | "joined" | "completed" | "withdrawn"
          interview_date?: string | null
          interview_notes?: string | null
          withdrawn_at?: string | null
          applied_at?: string
          updated_at?: string
        }
      }
      company_interns: {
        Row: {
          id: string
          company_id: string
          student_id: string
          internship_id: string | null
          mentor_id: string | null
          joining_date: string
          progress_pct: number
          attendance_pct: number
          status: "active" | "completed" | "terminated"
          notes: string | null
          rating: number | null
          weekly_reports: Json
          assigned_tasks: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          student_id: string
          internship_id?: string | null
          mentor_id?: string | null
          joining_date?: string
          progress_pct?: number
          attendance_pct?: number
          status?: "active" | "completed" | "terminated"
          notes?: string | null
          rating?: number | null
          weekly_reports?: Json
          assigned_tasks?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          student_id?: string
          internship_id?: string | null
          mentor_id?: string | null
          joining_date?: string
          progress_pct?: number
          attendance_pct?: number
          status?: "active" | "completed" | "terminated"
          notes?: string | null
          rating?: number | null
          weekly_reports?: Json
          assigned_tasks?: Json
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          student_id: string
          title: string
          description: string | null
          project_url: string | null
          github_url: string | null
          technologies: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          description?: string | null
          project_url?: string | null
          github_url?: string | null
          technologies?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          description?: string | null
          project_url?: string | null
          github_url?: string | null
          technologies?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      student_skills: {
        Row: {
          student_id: string
          skill_name: string
          proficiency: "beginner" | "intermediate" | "advanced"
        }
        Insert: {
          student_id: string
          skill_name: string
          proficiency: "beginner" | "intermediate" | "advanced"
        }
        Update: {
          student_id?: string
          skill_name?: string
          proficiency?: "beginner" | "intermediate" | "advanced"
        }
      }
      resumes: {
        Row: {
          id: string
          student_id: string
          name: string
          file_url: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          name: string
          file_url: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          name?: string
          file_url?: string
          is_primary?: boolean
          created_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          student_id: string
          name: string
          issuer: string
          issue_date: string
          expiry_date: string | null
          credential_id: string | null
          credential_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          name: string
          issuer: string
          issue_date: string
          expiry_date?: string | null
          credential_id?: string | null
          credential_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          name?: string
          issuer?: string
          issue_date?: string
          expiry_date?: string | null
          credential_id?: string | null
          credential_url?: string | null
          created_at?: string
        }
      }
      mentor_assignments: {
        Row: {
          id: string
          mentor_id: string
          student_id: string
          status: "active" | "completed" | "terminated"
          assigned_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          mentor_id: string
          student_id: string
          status?: "active" | "completed" | "terminated"
          assigned_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          mentor_id?: string
          student_id?: string
          status?: "active" | "completed" | "terminated"
          assigned_at?: string
          completed_at?: string | null
        }
      }
      mentor_feedback: {
        Row: {
          id: string
          assignment_id: string
          author_id: string
          feedback_text: string
          rating: number
          created_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          author_id: string
          feedback_text: string
          rating: number
          created_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          author_id?: string
          feedback_text?: string
          rating?: number
          created_at?: string
        }
      }
      portfolios: {
        Row: {
          id: string
          student_id: string
          title: string
          description: string | null
          asset_url: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          title: string
          description?: string | null
          asset_url: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          title?: string
          description?: string | null
          asset_url?: string
          created_at?: string
        }
      }
      ai_reports: {
        Row: {
          id: string
          student_id: string
          report_type: "resume_review" | "interview_prep" | "career_path" | "skills_gap"
          content: Json
          score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          report_type: "resume_review" | "interview_prep" | "career_path" | "skills_gap"
          content: Json
          score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          report_type?: "resume_review" | "interview_prep" | "career_path" | "skills_gap"
          content?: Json
          score?: number | null
          created_at?: string
        }
      }
      career_timeline: {
        Row: {
          id: string
          student_id: string
          event_type: "education" | "project" | "internship" | "skill_acquired" | "certificate"
          title: string
          description: string | null
          start_date: string
          end_date: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          event_type: "education" | "project" | "internship" | "skill_acquired" | "certificate"
          title: string
          description?: string | null
          start_date: string
          end_date?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          event_type?: "education" | "project" | "internship" | "skill_acquired" | "certificate"
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          reference_id?: string | null
          created_at?: string
        }
      }
      activity_feed: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          content: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          content: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          content?: string
          metadata?: Json
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string
          old_data: Json
          new_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id: string
          old_data?: Json
          new_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string
          old_data?: Json
          new_data?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "student" | "company" | "mentor" | "admin" | "super_admin"
    }
  }
}
