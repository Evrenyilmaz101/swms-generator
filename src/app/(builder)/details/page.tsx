"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore, useRememberMeStore } from "@/stores/builder-store";
import { businessDetailsSchema } from "@/lib/validators/form-schemas";
import { AUSTRALIAN_STATES } from "@/lib/constants/states";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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

  // Pre-fill from Remember Me on mount
  useEffect(() => {
    setCurrentStep("details");
    if (remembered && savedDetails && !businessDetails.business_name) {
      setBusinessDetails(savedDetails);
    }
    setLoaded(true);
  }, []);

  function handleChange(
    field: string,
    value: string
  ) {
    setBusinessDetails({ [field]: value });
    // Clear error on change
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

    // Resize to max 200x200 and convert to base64
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

    // Save to Remember Me if checked
    if (rememberMe) {
      saveDetails(businessDetails);
    } else {
      clearDetails();
    }

    router.push("/job");
  }

  if (!loaded) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-primary">Your Details</h1>
        <p className="text-muted mt-1">
          These appear on your SWMS document header.
        </p>
      </div>

      <Input
        label="Business Name"
        required
        placeholder="e.g. Smith Electrical Pty Ltd"
        value={businessDetails.business_name}
        onChange={(e) => handleChange("business_name", e.target.value)}
        error={errors.business_name}
      />

      <Input
        label="ABN"
        placeholder="11 digit ABN (optional)"
        value={businessDetails.abn}
        onChange={(e) => handleChange("abn", e.target.value)}
        error={errors.abn}
        hint="Optional — appears on the document if provided"
      />

      <Input
        label="Contact Name"
        required
        placeholder="Your name"
        value={businessDetails.contact_name}
        onChange={(e) => handleChange("contact_name", e.target.value)}
        error={errors.contact_name}
      />

      <Input
        label="Phone"
        required
        type="tel"
        placeholder="04XX XXX XXX"
        value={businessDetails.phone}
        onChange={(e) => handleChange("phone", e.target.value)}
        error={errors.phone}
      />

      <Select
        label="State / Territory"
        required
        placeholder="Select your state"
        options={AUSTRALIAN_STATES}
        value={businessDetails.state}
        onChange={(e) =>
          handleChange("state", e.target.value as AustralianState)
        }
        error={errors.state}
      />

      {/* Logo upload */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-primary">
          Business Logo (optional)
        </label>
        <p className="text-xs text-muted">
          Appears on the PDF header. Will be saved for next time.
        </p>
        <div className="flex items-center gap-4">
          {businessDetails.logo_base64 && (
            <img
              src={businessDetails.logo_base64}
              alt="Logo preview"
              className="w-16 h-16 object-contain rounded-lg border border-border"
            />
          )}
          <label className="cursor-pointer px-4 py-2 rounded-xl border-2 border-dashed border-border hover:border-accent text-sm text-muted hover:text-primary transition-colors">
            {businessDetails.logo_base64 ? "Change logo" : "Upload logo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </label>
          {businessDetails.logo_base64 && (
            <button
              type="button"
              onClick={() => setBusinessDetails({ logo_base64: "" })}
              className="text-xs text-muted hover:text-error"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Remember Me */}
      <label className="flex items-center gap-3 cursor-pointer py-2">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
        />
        <div>
          <span className="text-sm font-medium text-primary">
            Remember my details
          </span>
          <p className="text-xs text-muted">
            Pre-fill this form next time you visit
          </p>
        </div>
      </label>

      <Button type="submit" size="lg" className="w-full">
        Next: Describe Your Job
      </Button>
    </form>
  );
}
