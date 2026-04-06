"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore, useRememberMeStore } from "@/stores/builder-store";
import { businessDetailsSchema } from "@/lib/validators/form-schemas";
import { AUSTRALIAN_STATES } from "@/lib/constants/states";
import type { AustralianState } from "@/types/swms";

export default function DetailsPage() {
  const router = useRouter();
  const { businessDetails, setBusinessDetails, setCurrentStep } =
    useBuilderStore();
  const { remembered, savedDetails, saveDetails, clearDetails } =
    useRememberMeStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe] = useState(remembered);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCurrentStep("details");
    if (remembered && savedDetails && !businessDetails.business_name) {
      setBusinessDetails(savedDetails);
    }
    setLoaded(true);
  }, []);

  function handleChange(field: string, value: string) {
    setBusinessDetails({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 200;
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL("image/png");
        setBusinessDetails({ logo_base64: base64 });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = businessDetailsSchema.safeParse(businessDetails);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    if (rememberMe) {
      saveDetails(businessDetails);
    } else {
      clearDetails();
    }

    router.push("/checkout");
  }

  if (!loaded) return null;

  const inputClass =
    "w-full h-11 px-3.5 text-[14px] text-[#0C0A09] placeholder:text-[#A8A29E] bg-[#FAFAF9] border border-[#E7E5E4] rounded-[10px] outline-none focus:border-[#0C0A09] focus:bg-white transition-colors";
  const labelClass = "block text-[13px] font-medium text-[#0C0A09] mb-1.5";
  const errorClass = "text-[12px] text-red-600 mt-1";

  return (
    <form onSubmit={handleSubmit} className="max-w-[640px] mx-auto py-6 sm:py-20 px-1">
      {/* Eyebrow */}
      <p className="text-[11px] font-semibold text-[#78716C] tracking-[0.15em]">
        YOUR BUSINESS
      </p>

      {/* Headline */}
      <h1 className="text-[clamp(2rem,4.5vw,2.75rem)] font-bold text-[#0C0A09] tracking-[-0.03em] leading-[1.1] mt-2">
        Who&apos;s doing this job?
      </h1>
      <p className="text-[17px] text-[#78716C] mt-3 leading-relaxed">
        This appears on your SWMS document header. We&apos;ll remember it for next time.
      </p>

      {/* Form card */}
      <div className="mt-10 bg-white rounded-2xl border border-[#E7E5E4] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-7 space-y-5">
        {/* Logo upload */}
        <div className="flex items-center gap-4">
          {businessDetails.logo_base64 ? (
            <img
              src={businessDetails.logo_base64}
              alt="Logo preview"
              className="w-[72px] h-[72px] object-contain rounded-xl border border-[#E7E5E4] bg-[#FAFAF9]"
            />
          ) : (
            <label className="cursor-pointer w-[72px] h-[72px] rounded-xl bg-[#FAFAF9] border border-dashed border-[#D6D3D1] flex flex-col items-center justify-center gap-1 hover:border-[#78716C] transition-colors">
              <svg className="w-5 h-5 text-[#78716C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-[10px] font-medium text-[#78716C]">Logo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>
          )}
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-[#0C0A09]">Business logo</p>
            <p className="text-[13px] text-[#78716C]">
              Optional — appears top-left of document. PNG or JPG.
            </p>
            {businessDetails.logo_base64 && (
              <div className="flex gap-3 mt-1">
                <label className="cursor-pointer text-[12px] font-semibold text-[#0C0A09] hover:underline">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setBusinessDetails({ logo_base64: "" })}
                  className="text-[12px] font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-[#E7E5E4]" />

        {/* Business name */}
        <div>
          <label className={labelClass}>Business name</label>
          <input
            type="text"
            placeholder="e.g. Smith Electrical Pty Ltd"
            value={businessDetails.business_name}
            onChange={(e) => handleChange("business_name", e.target.value)}
            className={inputClass}
          />
          {errors.business_name && <p className={errorClass}>{errors.business_name}</p>}
        </div>

        {/* ABN + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>ABN</label>
            <input
              type="text"
              placeholder="11 digit ABN"
              value={businessDetails.abn}
              onChange={(e) => handleChange("abn", e.target.value)}
              className={inputClass}
            />
            {errors.abn && <p className={errorClass}>{errors.abn}</p>}
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              placeholder="04XX XXX XXX"
              value={businessDetails.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={inputClass}
            />
            {errors.phone && <p className={errorClass}>{errors.phone}</p>}
          </div>
        </div>

        {/* Contact name */}
        <div>
          <label className={labelClass}>Your name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={businessDetails.contact_name}
            onChange={(e) => handleChange("contact_name", e.target.value)}
            className={inputClass}
          />
          {errors.contact_name && <p className={errorClass}>{errors.contact_name}</p>}
        </div>

        {/* State */}
        <div>
          <label className={labelClass}>State / Territory</label>
          <select
            value={businessDetails.state}
            onChange={(e) => handleChange("state", e.target.value as AustralianState)}
            className={inputClass + " appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2014%2014%22%20fill%3D%22none%22%20stroke%3D%22%2378716C%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%223.5%205.25%207%208.75%2010.5%205.25%22%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center] pr-10"}
          >
            <option value="">Select your state</option>
            {AUSTRALIAN_STATES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {errors.state && <p className={errorClass}>{errors.state}</p>}
        </div>

        {/* Remember me */}
        <label className="flex items-start gap-3 cursor-pointer pt-2">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-[18px] h-[18px] rounded border border-[#D6D3D1] peer-checked:bg-[#0C0A09] peer-checked:border-[#0C0A09] flex items-center justify-center transition-colors">
              {rememberMe && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-[14px] font-medium text-[#0C0A09]">
            Remember these details next time
          </span>
        </label>
      </div>

      {/* CTA row */}
      <div className="flex items-center justify-between mt-6 sm:mt-8">
        <button
          type="button"
          onClick={() => router.push("/review")}
          className="text-[13px] sm:text-[14px] font-medium text-[#78716C] hover:text-[#0C0A09] transition-colors shrink-0"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-[#0C0A09] text-white text-[14px] sm:text-[15px] font-semibold rounded-[10px] hover:bg-[#1C1917] transition-colors"
        >
          Continue
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </form>
  );
}
