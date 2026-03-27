// Australian state/territory legislation references
// VIC and WA have different acts from the harmonised WHS framework

import type { AustralianState } from "@/types/swms";

export interface StateLegislation {
  state: AustralianState;
  full_name: string;
  regulator: string;
  primary_act: string;
  regulations: string;
  additional_references: string[];
}

export const STATE_LEGISLATION: Record<AustralianState, StateLegislation> = {
  NSW: {
    state: "NSW",
    full_name: "New South Wales",
    regulator: "SafeWork NSW",
    primary_act: "Work Health and Safety Act 2011 (NSW)",
    regulations: "Work Health and Safety Regulation 2017 (NSW)",
    additional_references: [
      "WHS Regulation 2017, Part 6.3 — High Risk Construction Work",
      "SafeWork NSW Code of Practice: Construction Work",
    ],
  },
  VIC: {
    state: "VIC",
    full_name: "Victoria",
    regulator: "WorkSafe Victoria",
    primary_act: "Occupational Health and Safety Act 2004 (Vic)",
    regulations: "Occupational Health and Safety Regulations 2017 (Vic)",
    additional_references: [
      "OHS Regulations 2017, Part 5.1 — Construction",
      "WorkSafe Victoria Compliance Code: Workplace Amenities and Work Environment",
    ],
  },
  QLD: {
    state: "QLD",
    full_name: "Queensland",
    regulator: "Workplace Health and Safety Queensland",
    primary_act: "Work Health and Safety Act 2011 (Qld)",
    regulations: "Work Health and Safety Regulation 2011 (Qld)",
    additional_references: [
      "WHS Regulation 2011, Chapter 6, Part 3 — High Risk Construction Work",
      "WHSQ Code of Practice: Construction Work",
    ],
  },
  WA: {
    state: "WA",
    full_name: "Western Australia",
    regulator: "WorkSafe WA",
    primary_act: "Work Health and Safety Act 2020 (WA)",
    regulations: "Work Health and Safety (General) Regulations 2022 (WA)",
    additional_references: [
      "WHS (General) Regulations 2022, Part 6.3 — High Risk Construction Work",
      "WorkSafe WA Code of Practice: Construction Work",
    ],
  },
  SA: {
    state: "SA",
    full_name: "South Australia",
    regulator: "SafeWork SA",
    primary_act: "Work Health and Safety Act 2012 (SA)",
    regulations: "Work Health and Safety Regulations 2012 (SA)",
    additional_references: [
      "WHS Regulations 2012, Part 6.3 — High Risk Construction Work",
      "SafeWork SA Code of Practice: Construction Work",
    ],
  },
  TAS: {
    state: "TAS",
    full_name: "Tasmania",
    regulator: "WorkSafe Tasmania",
    primary_act: "Work Health and Safety Act 2012 (Tas)",
    regulations: "Work Health and Safety Regulations 2012 (Tas)",
    additional_references: [
      "WHS Regulations 2012, Part 6.3 — High Risk Construction Work",
      "WorkSafe Tasmania Code of Practice: Construction Work",
    ],
  },
  NT: {
    state: "NT",
    full_name: "Northern Territory",
    regulator: "NT WorkSafe",
    primary_act: "Work Health and Safety (National Uniform Legislation) Act 2011 (NT)",
    regulations:
      "Work Health and Safety (National Uniform Legislation) Regulations 2011 (NT)",
    additional_references: [
      "WHS Regulations 2011, Part 6.3 — High Risk Construction Work",
    ],
  },
  ACT: {
    state: "ACT",
    full_name: "Australian Capital Territory",
    regulator: "WorkSafe ACT",
    primary_act: "Work Health and Safety Act 2011 (ACT)",
    regulations: "Work Health and Safety Regulation 2011 (ACT)",
    additional_references: [
      "WHS Regulation 2011, Part 6.3 — High Risk Construction Work",
      "WorkSafe ACT Code of Practice: Construction Work",
    ],
  },
};

export const AUSTRALIAN_STATES: {
  value: AustralianState;
  label: string;
}[] = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "NT", label: "Northern Territory" },
  { value: "ACT", label: "Australian Capital Territory" },
];
