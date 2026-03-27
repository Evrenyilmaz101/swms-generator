import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BusinessDetails, JobDetails, BuilderStep } from "@/types/form";
import type { SwmsData, PhotoHazard } from "@/types/swms";

interface BuilderState {
  // Current step
  currentStep: BuilderStep;
  setCurrentStep: (step: BuilderStep) => void;

  // Step 1: Business details
  businessDetails: BusinessDetails;
  setBusinessDetails: (details: Partial<BusinessDetails>) => void;

  // Step 2: Job details
  jobDetails: JobDetails;
  setJobDetails: (details: Partial<JobDetails>) => void;

  // Photo hazards (from site photo scan)
  photoHazards: PhotoHazard[];
  setPhotoHazards: (hazards: PhotoHazard[]) => void;
  togglePhotoHazard: (index: number) => void;

  // Step 3: Generated SWMS data
  generatedSwms: SwmsData | null;
  setGeneratedSwms: (data: SwmsData | null) => void;
  complianceScore: number;
  setComplianceScore: (score: number) => void;
  validationWarnings: string[];
  setValidationWarnings: (warnings: string[]) => void;

  // Generation state
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  generationError: string | null;
  setGenerationError: (error: string | null) => void;

  // Token (for paid downloads / 3-pack redemptions)
  redemptionToken: string | null;
  setRedemptionToken: (token: string | null) => void;

  // Reset the entire form
  reset: () => void;
}

const DEFAULT_BUSINESS_DETAILS: BusinessDetails = {
  business_name: "",
  abn: "",
  contact_name: "",
  phone: "",
  state: "",
  logo_base64: "",
};

const DEFAULT_JOB_DETAILS: JobDetails = {
  job_description: "",
  site_address: "",
  principal_contractor: "",
  job_reference: "",
  photo_hazards: [],
};

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      currentStep: "details",
      setCurrentStep: (step) => set({ currentStep: step }),

      businessDetails: DEFAULT_BUSINESS_DETAILS,
      setBusinessDetails: (details) =>
        set((state) => ({
          businessDetails: { ...state.businessDetails, ...details },
        })),

      jobDetails: DEFAULT_JOB_DETAILS,
      setJobDetails: (details) =>
        set((state) => ({
          jobDetails: { ...state.jobDetails, ...details },
        })),

      photoHazards: [],
      setPhotoHazards: (hazards) => set({ photoHazards: hazards }),
      togglePhotoHazard: (index) =>
        set((state) => ({
          photoHazards: state.photoHazards.map((h, i) =>
            i === index ? { ...h, selected: !h.selected } : h
          ),
        })),

      generatedSwms: null,
      setGeneratedSwms: (data) => set({ generatedSwms: data }),
      complianceScore: 0,
      setComplianceScore: (score) => set({ complianceScore: score }),
      validationWarnings: [],
      setValidationWarnings: (warnings) =>
        set({ validationWarnings: warnings }),

      isGenerating: false,
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      generationError: null,
      setGenerationError: (error) => set({ generationError: error }),

      redemptionToken: null,
      setRedemptionToken: (token) => set({ redemptionToken: token }),

      reset: () =>
        set({
          currentStep: "details",
          businessDetails: DEFAULT_BUSINESS_DETAILS,
          jobDetails: DEFAULT_JOB_DETAILS,
          photoHazards: [],
          generatedSwms: null,
          complianceScore: 0,
          validationWarnings: [],
          isGenerating: false,
          generationError: null,
          redemptionToken: null,
        }),
    }),
    {
      name: "swms-builder",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? sessionStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      // Only persist form data, not transient UI state
      partialize: (state) => ({
        currentStep: state.currentStep,
        businessDetails: state.businessDetails,
        jobDetails: state.jobDetails,
        photoHazards: state.photoHazards,
        generatedSwms: state.generatedSwms,
        complianceScore: state.complianceScore,
        redemptionToken: state.redemptionToken,
      }),
    }
  )
);

// Separate store for "Remember Me" -- persists in localStorage (survives sessions)
interface RememberMeState {
  remembered: boolean;
  savedDetails: BusinessDetails | null;
  saveDetails: (details: BusinessDetails) => void;
  clearDetails: () => void;
}

export const useRememberMeStore = create<RememberMeState>()(
  persist(
    (set) => ({
      remembered: false,
      savedDetails: null,
      saveDetails: (details) =>
        set({ remembered: true, savedDetails: details }),
      clearDetails: () => set({ remembered: false, savedDetails: null }),
    }),
    {
      name: "swms-remember-me",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);
