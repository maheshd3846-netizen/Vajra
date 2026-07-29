/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateMentorProfileAction } from "@/app/actions/mentor";
import {
  User,
  Briefcase,
  Globe,
  Mail,
  Clock,
  Sparkles,
  Camera,
  Save,
  RotateCcw,
  AlertTriangle,
  Plus,
  X,
  Check,
  Loader2,
  Shield,
  Award,
} from "lucide-react";

export interface MentorProfileInitialData {
  full_name: string;
  avatar_url: string;
  job_title: string;
  company_name: string;
  experience: string;
  skills: string[];
  expertise: string[];
  bio: string;
  linkedin_url: string;
  website_url: string;
  availability: string;
  contact_email: string;
  is_verified: boolean;
}

interface MentorSettingsClientProps {
  initialData: MentorProfileInitialData;
}

export default function MentorSettingsClient({ initialData }: MentorSettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<MentorProfileInitialData>(initialData);
  const [savedData, setSavedData] = useState<MentorProfileInitialData>(initialData);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newExpertiseInput, setNewExpertiseInput] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDirty = JSON.stringify(formData) !== JSON.stringify(savedData);

  const validateField = (field: string, value: string) => {
    let err = "";
    if (field === "full_name" && !value.trim()) {
      err = "Full name is required";
    } else if (field === "linkedin_url" && value) {
      if (!value.startsWith("http://") && !value.startsWith("https://")) {
        err = "URL must start with http:// or https://";
      }
    } else if (field === "website_url" && value) {
      if (!value.startsWith("http://") && !value.startsWith("https://")) {
        err = "URL must start with http:// or https://";
      }
    } else if (field === "contact_email" && value) {
      if (!/\S+@\S+\.\S+/.test(value)) {
        err = "Enter a valid email address";
      }
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) {
      toast.error("Skill already added");
      return;
    }
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddExpertise = () => {
    const trimmed = newExpertiseInput.trim();
    if (!trimmed) return;
    if (formData.expertise.includes(trimmed)) {
      toast.error("Expertise area already added");
      return;
    }
    setFormData((prev) => ({ ...prev, expertise: [...prev.expertise, trimmed] }));
    setNewExpertiseInput("");
  };

  const handleRemoveExpertise = (expToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((e) => e !== expToRemove),
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo file size must be less than 5MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Authentication required");
        return;
      }

      const ext = file.name.split(".").pop();
      const fileName = `mentor-${user.id}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadErr) {
        toast.error(`Upload failed: ${uploadErr.message}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Mentor photo uploaded successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload photo.";
      toast.error(errorMessage);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasErr = Object.values(errors).some((err) => Boolean(err));
    if (hasErr) {
      toast.error("Please resolve validation errors before saving.");
      return;
    }

    if (!formData.full_name.trim()) {
      toast.error("Full name is required.");
      return;
    }

    setIsSubmitting(true);
    setSavedData(formData);

    const res = await updateMentorProfileAction({
      full_name: formData.full_name,
      avatar_url: formData.avatar_url,
      job_title: formData.job_title,
      company_name: formData.company_name,
      experience: formData.experience,
      skills: formData.skills,
      expertise: formData.expertise,
      bio: formData.bio,
      linkedin_url: formData.linkedin_url,
      website_url: formData.website_url,
      availability: formData.availability,
      contact_email: formData.contact_email,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success("Mentor settings updated successfully!");
      router.refresh();
    } else {
      setSavedData(savedData);
      toast.error(res.error || "Failed to update mentor profile.");
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelModal(true);
    }
  };

  const confirmCancel = () => {
    setFormData(savedData);
    setErrors({});
    setShowCancelModal(false);
    toast.info("Changes reset to original state.");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-widest mb-1">
            <Award className="w-4 h-4" />
            Mentor Profile Settings
          </div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Edit Mentor Settings</h1>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Update your professional title, technical expertise areas, experience level, and office availability.
          </p>
        </div>

        {isDirty && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Unsaved Banner */}
      {isDirty && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>You have unsaved mentor profile updates. Save to keep your modifications active.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-2.5 py-1 rounded bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-slate-800 transition"
            >
              Discard
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
            >
              Save Now
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photo & Personal Info */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-6">
          <h2 className="text-base font-bold flex items-center gap-2 text-blue-400">
            <User className="w-5 h-5" />
            Mentor Photo & Identity
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-2xl bg-slate-800 border-2 border-white/10 overflow-hidden flex items-center justify-center font-bold text-2xl text-slate-400 shadow-inner">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Mentor Avatar" className="h-full w-full object-cover" />
                ) : (
                  formData.full_name?.[0] || "M"
                )}
              </div>
              <label
                htmlFor="mentor-photo-upload"
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-medium cursor-pointer transition"
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 mb-1" />
                    Change Photo
                  </>
                )}
              </label>
              <input
                type="file"
                id="mentor-photo-upload"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
              />
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <h3 className="font-semibold text-sm text-white">Mentor Photo</h3>
              <p className="text-xs text-slate-400 font-sans">
                Upload a professional headshot for student cohort visibility. JPG, PNG, WEBP max 5MB.
              </p>
              <div className="pt-1 flex items-center justify-center sm:justify-start gap-1.5 text-xs text-emerald-400 font-mono">
                <Shield className="w-3.5 h-3.5" />
                {formData.is_verified ? "Verified Mentor" : "Pending Verification Review"}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Dr. Alex Vance"
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border text-sm text-white focus:outline-none transition ${
                  errors.full_name ? "border-red-500" : "border-white/10 focus:border-blue-500"
                }`}
              />
              {errors.full_name && <p className="text-[11px] text-red-400">{errors.full_name}</p>}
            </div>

            {/* Designation / Job Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Designation / Job Title
              </label>
              <input
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                placeholder="e.g. Principal Staff Engineer"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Current Company</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="e.g. Google / Microsoft"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Experience */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Years of Experience</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 8+ Years in Systems Architecture"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Contact Email
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="mentor@domain.com"
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border text-sm text-white focus:outline-none transition ${
                  errors.contact_email ? "border-red-500" : "border-white/10 focus:border-blue-500"
                }`}
              />
              {errors.contact_email && <p className="text-[11px] text-red-400">{errors.contact_email}</p>}
            </div>

            {/* Availability */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Availability Hours
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="e.g. Weekdays 5 PM – 7 PM IST"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Mentor Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Mentor Bio & Guidance Approach</label>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Share your mentoring philosophy, technical background, and how you assist students..."
              className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Skills & Domain Expertise */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-6">
          <h2 className="text-base font-bold flex items-center gap-2 text-purple-400">
            <Sparkles className="w-5 h-5" />
            Skills & Expertise Areas
          </h2>

          {/* Technical Skills Tag Manager */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Technical Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add technical skill (e.g. System Design, Microservices, PyTorch)"
                className="flex-1 px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {formData.skills.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No technical skills listed.</p>
              ) : (
                formData.skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 text-xs text-purple-300 border border-purple-500/20 shadow-sm"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-slate-400 hover:text-red-400 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Mentorship Expertise Areas */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs font-semibold text-slate-300 block">Mentorship Expertise Domains</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newExpertiseInput}
                onChange={(e) => setNewExpertiseInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddExpertise();
                  }
                }}
                placeholder="Add expertise (e.g. System Architecture, Resume Reviews, Interview Prep)"
                className="flex-1 px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={handleAddExpertise}
                className="px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-4 h-4" />
                Add Domain
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {formData.expertise.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No expertise areas specified.</p>
              ) : (
                formData.expertise.map((e) => (
                  <span
                    key={e}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 text-xs text-indigo-300 border border-indigo-500/20 shadow-sm"
                  >
                    {e}
                    <button
                      type="button"
                      onClick={() => handleRemoveExpertise(e)}
                      className="text-slate-400 hover:text-red-400 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Links & Social */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-6">
          <h2 className="text-base font-bold flex items-center gap-2 text-emerald-400">
            <Globe className="w-5 h-5" />
            Social & Website Links
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* LinkedIn URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">LinkedIn Profile URL</label>
              <input
                type="text"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/mentorname"
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border text-sm text-white focus:outline-none transition ${
                  errors.linkedin_url ? "border-red-500" : "border-white/10 focus:border-emerald-500"
                }`}
              />
              {errors.linkedin_url && <p className="text-[11px] text-red-400">{errors.linkedin_url}</p>}
            </div>

            {/* Personal Website */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Personal Website / Blog</label>
              <input
                type="text"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                placeholder="https://mentorblog.dev"
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border text-sm text-white focus:outline-none transition ${
                  errors.website_url ? "border-red-500" : "border-white/10 focus:border-emerald-500"
                }`}
              />
              {errors.website_url && <p className="text-[11px] text-red-400">{errors.website_url}</p>}
            </div>
          </div>
        </div>

        {/* Bottom Save & Cancel */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty || isSubmitting}
            className="px-5 py-2.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-white/10 rounded-xl transition disabled:opacity-40"
          >
            Cancel / Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Mentor Settings
              </>
            )}
          </button>
        </div>
      </form>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Discard Mentor Edits?</h3>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Are you sure you want to discard your edits? Your mentor profile parameters will revert to their saved state.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
