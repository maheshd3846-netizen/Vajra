/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateStudentProfileAction } from "@/app/actions/student";
import {
  User,
  GraduationCap,
  Link2,
  Phone,
  MapPin,
  Target,
  Sparkles,
  Camera,
  Save,
  RotateCcw,
  AlertTriangle,
  Plus,
  X,
  Check,
  Loader2,
} from "lucide-react";

export interface StudentProfileInitialData {
  full_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  university: string;
  degree: string;
  branch: string;
  graduation_year: string;
  cgpa: string;
  target_role: string;
  skills: string[];
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  phone: string;
  location: string;
}

interface StudentSettingsClientProps {
  initialData: StudentProfileInitialData;
}

export default function StudentSettingsClient({ initialData }: StudentSettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<StudentProfileInitialData>(initialData);
  const [savedData, setSavedData] = useState<StudentProfileInitialData>(initialData);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDirty = JSON.stringify(formData) !== JSON.stringify(savedData);

  // Live Form Validation
  const validateField = (field: string, value: string) => {
    let err = "";
    if (field === "full_name" && !value.trim()) {
      err = "Full name is required";
    } else if (field === "cgpa" && value) {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 10) {
        err = "CGPA must be between 0.0 and 10.0";
      }
    } else if (field === "graduation_year" && value) {
      const yr = parseInt(value, 10);
      if (isNaN(yr) || yr < 1990 || yr > 2100) {
        err = "Enter a valid year (1990–2100)";
      }
    } else if (field === "linkedin_url" && value) {
      if (!value.startsWith("http://") && !value.startsWith("https://")) {
        err = "URL must start with http:// or https://";
      }
    } else if (field === "github_url" && value) {
      if (!value.startsWith("http://") && !value.startsWith("https://")) {
        err = "URL must start with http:// or https://";
      }
    } else if (field === "portfolio_url" && value) {
      if (!value.startsWith("http://") && !value.startsWith("https://")) {
        err = "URL must start with http:// or https://";
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

  // Image Upload to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Authentication required");
        return;
      }

      const ext = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;

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
      toast.success("Profile photo uploaded successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload image.";
      toast.error(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for errors
    const hasErr = Object.values(errors).some((err) => Boolean(err));
    if (hasErr) {
      toast.error("Please resolve form validation errors before saving.");
      return;
    }

    if (!formData.full_name.trim()) {
      toast.error("Full name is required.");
      return;
    }

    setIsSubmitting(true);
    // Optimistic state
    setSavedData(formData);

    const res = await updateStudentProfileAction({
      full_name: formData.full_name,
      avatar_url: formData.avatar_url,
      bio: formData.bio,
      university: formData.university,
      degree: formData.degree,
      branch: formData.branch,
      graduation_year: formData.graduation_year ? parseInt(formData.graduation_year, 10) : undefined,
      cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
      target_role: formData.target_role,
      skills: formData.skills,
      linkedin_url: formData.linkedin_url,
      github_url: formData.github_url,
      portfolio_url: formData.portfolio_url,
      phone: formData.phone,
      location: formData.location,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success("Profile settings updated successfully!");
      router.refresh();
    } else {
      // Revert optimistic update on error
      setSavedData(savedData);
      toast.error(res.error || "Failed to save settings.");
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
            <Sparkles className="w-4 h-4" />
            Student Account Settings
          </div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Edit Profile</h1>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Update your personal details, academic history, target career roles, and online presence.
          </p>
        </div>

        {/* Top Actions */}
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

      {/* Unsaved Changes Banner */}
      {isDirty && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>You have unsaved changes on your profile. Remember to save before navigating away.</span>
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
        {/* Avatar Upload & Basic Profile */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-6">
          <h2 className="text-base font-bold flex items-center gap-2 text-blue-400">
            <User className="w-5 h-5" />
            Personal & Photo
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-2xl bg-slate-800 border-2 border-white/10 overflow-hidden flex items-center justify-center font-bold text-2xl text-slate-400 shadow-inner">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  formData.full_name?.[0] || "S"
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-medium cursor-pointer transition"
              >
                {uploadingImage ? (
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
                id="avatar-upload"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <h3 className="font-semibold text-sm text-white">Profile Photo</h3>
              <p className="text-xs text-slate-400 font-sans">
                Upload a professional avatar or headshot. JPG, PNG, WEBP max 5MB.
              </p>
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
                placeholder="e.g. Mahesh Das"
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border text-sm text-white focus:outline-none transition ${
                  errors.full_name ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-blue-500"
                }`}
              />
              {errors.full_name && <p className="text-[11px] text-red-400">{errors.full_name}</p>}
            </div>

            {/* Email Address (Read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Email Address (Primary Account)</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3.5 py-2.5 bg-slate-950/40 rounded-xl border border-white/5 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country (e.g. Bangalore, India)"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Short Bio</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell recruiters about your engineering passion, career ambitions, and technical interests..."
              className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Academics & Target Role */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-6">
          <h2 className="text-base font-bold flex items-center gap-2 text-purple-400">
            <GraduationCap className="w-5 h-5" />
            Academic Details & Target Role
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* University */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">University / College</label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="e.g. National Institute of Technology"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Target Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                Target Role / Career Goal
              </label>
              <input
                type="text"
                name="target_role"
                value={formData.target_role}
                onChange={handleChange}
                placeholder="e.g. Full Stack Engineer / AI Intern"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Degree */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Degree</label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="e.g. B.Tech / B.E."
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Branch / Major */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Branch / Specialization</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Graduation Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Graduation Year</label>
              <input
                type="number"
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
                placeholder="2026"
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border text-sm text-white focus:outline-none transition ${
                  errors.graduation_year ? "border-red-500" : "border-white/10 focus:border-purple-500"
                }`}
              />
              {errors.graduation_year && <p className="text-[11px] text-red-400">{errors.graduation_year}</p>}
            </div>

            {/* CGPA */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">CGPA (Scale of 10.0)</label>
              <input
                type="text"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                placeholder="8.75"
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border text-sm text-white focus:outline-none transition ${
                  errors.cgpa ? "border-red-500" : "border-white/10 focus:border-purple-500"
                }`}
              />
              {errors.cgpa && <p className="text-[11px] text-red-400">{errors.cgpa}</p>}
            </div>
          </div>
        </div>

        {/* Skills Tag Management */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-5 h-5" />
            Skills & Competencies
          </h2>

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
              placeholder="Add skill (e.g. React, TypeScript, Python, Node.js)"
              className="flex-1 px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {formData.skills.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No skills added yet. Add your core technical skills above.</p>
            ) : (
              formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 text-xs text-cyan-300 border border-cyan-500/20 shadow-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-red-400 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Links & Social Profiles */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-6">
          <h2 className="text-base font-bold flex items-center gap-2 text-emerald-400">
            <Link2 className="w-5 h-5" />
            Social & Portfolio Links
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* LinkedIn */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">LinkedIn URL</label>
              <input
                type="text"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border text-sm text-white focus:outline-none transition ${
                  errors.linkedin_url ? "border-red-500" : "border-white/10 focus:border-emerald-500"
                }`}
              />
              {errors.linkedin_url && <p className="text-[11px] text-red-400">{errors.linkedin_url}</p>}
            </div>

            {/* GitHub */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">GitHub URL</label>
              <input
                type="text"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border text-sm text-white focus:outline-none transition ${
                  errors.github_url ? "border-red-500" : "border-white/10 focus:border-emerald-500"
                }`}
              />
              {errors.github_url && <p className="text-[11px] text-red-400">{errors.github_url}</p>}
            </div>

            {/* Portfolio Website */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Personal Portfolio / Website URL</label>
              <input
                type="text"
                name="portfolio_url"
                value={formData.portfolio_url}
                onChange={handleChange}
                placeholder="https://myportfolio.dev"
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border text-sm text-white focus:outline-none transition ${
                  errors.portfolio_url ? "border-red-500" : "border-white/10 focus:border-emerald-500"
                }`}
              />
              {errors.portfolio_url && <p className="text-[11px] text-red-400">{errors.portfolio_url}</p>}
            </div>
          </div>
        </div>

        {/* Bottom Save & Reset */}
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
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 max-w-md w-full space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Discard Unsaved Changes?</h3>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              You have unsaved edits on your profile. Reverting will reset all form fields back to their last saved state.
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
