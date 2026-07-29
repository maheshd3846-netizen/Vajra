/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateCompanyProfileAction } from "@/app/actions/company";
import {
  Building,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  Shield,
  Camera,
  Save,
  RotateCcw,
  AlertTriangle,
  Check,
  Loader2,
} from "lucide-react";

export interface CompanyProfileInitialData {
  name: string;
  logo_url: string;
  industry: string;
  website: string;
  company_size: string;
  description: string;
  headquarters: string;
  contact_email: string;
  contact_phone: string;
  hr_name: string;
  is_verified: boolean;
  gst_number: string;
  official_email: string;
}

interface CompanySettingsClientProps {
  initialData: CompanyProfileInitialData;
}

export default function CompanySettingsClient({ initialData }: CompanySettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<CompanyProfileInitialData>(initialData);
  const [savedData, setSavedData] = useState<CompanyProfileInitialData>(initialData);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDirty = JSON.stringify(formData) !== JSON.stringify(savedData);

  const validateField = (field: string, value: string) => {
    let err = "";
    if (field === "name" && !value.trim()) {
      err = "Company name is required";
    } else if (field === "website" && value) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo file size must be less than 5MB");
      return;
    }

    try {
      setUploadingLogo(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Authentication required");
        return;
      }

      const ext = file.name.split(".").pop();
      const fileName = `company-${user.id}/${Date.now()}.${ext}`;

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

      setFormData((prev) => ({ ...prev, logo_url: publicUrl }));
      toast.success("Company logo uploaded successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload logo.";
      toast.error(errorMessage);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasErr = Object.values(errors).some((err) => Boolean(err));
    if (hasErr) {
      toast.error("Please resolve validation errors before saving.");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Company name is required.");
      return;
    }

    setIsSubmitting(true);
    setSavedData(formData);

    const res = await updateCompanyProfileAction({
      name: formData.name,
      logo_url: formData.logo_url,
      industry: formData.industry,
      website: formData.website,
      company_size: formData.company_size,
      description: formData.description,
      headquarters: formData.headquarters,
      contact_email: formData.contact_email,
      contact_phone: formData.contact_phone,
      hr_name: formData.hr_name,
      gst_number: formData.gst_number,
      official_email: formData.official_email,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success("Company settings updated successfully!");
      router.refresh();
    } else {
      setSavedData(savedData);
      toast.error(res.error || "Failed to update company settings.");
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
            <Building className="w-4 h-4" />
            Organization Profile
          </div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Company Settings</h1>
          <p className="text-sm text-slate-400 font-sans mt-1">
            Manage your company profile, branding, size, headquarters, and recruiting contacts.
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

      {/* Unsaved Changes Banner */}
      {isDirty && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Unsaved company edits detected. Save your updates to make them live.</span>
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
        {/* Branding & Name */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-6">
          <h2 className="text-base font-bold flex items-center gap-2 text-blue-400">
            <Building className="w-5 h-5" />
            Company Identity & Logo
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-2xl bg-slate-800 border-2 border-white/10 overflow-hidden flex items-center justify-center font-bold text-2xl text-slate-400 shadow-inner">
                {formData.logo_url ? (
                  <img src={formData.logo_url} alt="Company Logo" className="h-full w-full object-cover" />
                ) : (
                  formData.name?.[0] || "C"
                )}
              </div>
              <label
                htmlFor="logo-upload"
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-medium cursor-pointer transition"
              >
                {uploadingLogo ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 mb-1" />
                    Upload Logo
                  </>
                )}
              </label>
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="hidden"
              />
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <h3 className="font-semibold text-sm text-white">Company Logo</h3>
              <p className="text-xs text-slate-400 font-sans">
                Upload your brand logo for job postings and recruiter profile. PNG, JPG, WEBP max 5MB.
              </p>
              <div className="pt-1 flex items-center justify-center sm:justify-start gap-1.5 text-xs text-emerald-400 font-mono">
                <Shield className="w-3.5 h-3.5" />
                {formData.is_verified ? "Verified Employer" : "Pending Verification Review"}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Company Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Acme Innovations Tech"
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border text-sm text-white focus:outline-none transition ${
                  errors.name ? "border-red-500" : "border-white/10 focus:border-blue-500"
                }`}
              />
              {errors.name && <p className="text-[11px] text-red-400">{errors.name}</p>}
            </div>

            {/* Industry */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Industry / Sector</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="e.g. Software & SaaS, FinTech, AI"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Website URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Website URL
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://company.com"
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border text-sm text-white focus:outline-none transition ${
                  errors.website ? "border-red-500" : "border-white/10 focus:border-blue-500"
                }`}
              />
              {errors.website && <p className="text-[11px] text-red-400">{errors.website}</p>}
            </div>

            {/* Company Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Company Size
              </label>
              <select
                name="company_size"
                value={formData.company_size}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              >
                <option value="" className="bg-slate-900 text-slate-400">Select Employee Range</option>
                <option value="1-10 Employees" className="bg-slate-900 text-white">1-10 Employees (Seed / Early)</option>
                <option value="11-50 Employees" className="bg-slate-900 text-white">11-50 Employees (Startup)</option>
                <option value="51-200 Employees" className="bg-slate-900 text-white">51-200 Employees (Growth Scale)</option>
                <option value="201-500 Employees" className="bg-slate-900 text-white">201-500 Employees (Mid-Market)</option>
                <option value="500+ Employees" className="bg-slate-900 text-white">500+ Employees (Enterprise)</option>
              </select>
            </div>

            {/* Headquarters */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Headquarters Address / City
              </label>
              <input
                type="text"
                name="headquarters"
                value={formData.headquarters}
                onChange={handleChange}
                placeholder="e.g. Silicon Valley, CA / Bangalore, India"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Company Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your company culture, mission, engineering values, and what kind of talent you seek..."
              className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* HR & Contact Information */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl space-y-6">
          <h2 className="text-base font-bold flex items-center gap-2 text-indigo-400">
            <Mail className="w-5 h-5" />
            Recruiter & HR Contact Details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* HR Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Primary HR / Contact Person Name</label>
              <input
                type="text"
                name="hr_name"
                value={formData.hr_name}
                onChange={handleChange}
                placeholder="e.g. Sarah Jenkins (Talent Lead)"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Recruiting Contact Email</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="careers@company.com"
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border text-sm text-white focus:outline-none transition ${
                  errors.contact_email ? "border-red-500" : "border-white/10 focus:border-indigo-500"
                }`}
              />
              {errors.contact_email && <p className="text-[11px] text-red-400">{errors.contact_email}</p>}
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Contact Phone
              </label>
              <input
                type="text"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-1234"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* GST / Business Reg No */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">GST / Tax Registration ID</label>
              <input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-indigo-500 transition font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save / Reset */}
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
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Discard Edits?</h3>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Are you sure you want to discard your company profile changes? Any modified information will be lost.
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
