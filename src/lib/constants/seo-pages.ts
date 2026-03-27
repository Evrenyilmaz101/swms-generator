// SEO landing page data for state-specific and trade-specific pages
// Each page targets a high-intent search keyword

import type { AustralianState } from "@/types/swms";

export interface SeoStatePage {
  slug: string;
  state: AustralianState;
  stateName: string;
  regulator: string;
  primaryAct: string;
  regulations: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  whyNeeded: string;
  fines: string;
  cta: string;
}

export interface SeoTradePage {
  slug: string;
  trade: string;
  tradePlural: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  commonHazards: string[];
  commonHrcw: string[];
  exampleJob: string;
  cta: string;
}

export const SEO_STATE_PAGES: SeoStatePage[] = [
  {
    slug: "swms-template-nsw",
    state: "NSW",
    stateName: "New South Wales",
    regulator: "SafeWork NSW",
    primaryAct: "Work Health and Safety Act 2011 (NSW)",
    regulations: "Work Health and Safety Regulation 2017 (NSW)",
    title: "SWMS Template NSW | Free Generator for New South Wales",
    metaDescription:
      "Generate a compliant NSW SWMS in 60 seconds. References Work Health and Safety Act 2011 (NSW) and WHS Regulation 2017. From $7.99.",
    h1: "NSW SWMS Template Generator",
    intro:
      "Need a SWMS for a job in New South Wales? Our AI generator creates compliant Safe Work Method Statements that reference the correct NSW legislation, including the Work Health and Safety Act 2011 and WHS Regulation 2017.",
    whyNeeded:
      "Under NSW WHS law, a SWMS is required before any high-risk construction work (HRCW) begins. The principal contractor must ensure a SWMS is prepared and followed for all 19 categories of HRCW defined in the WHS Regulation 2017, Part 6.3.",
    fines:
      "Failure to prepare a SWMS for HRCW in NSW can result in fines of up to $6,000 for individuals and $30,000 for businesses. SafeWork NSW inspectors actively check for SWMS compliance on construction sites.",
    cta: "Generate Your NSW SWMS",
  },
  {
    slug: "swms-template-vic",
    state: "VIC",
    stateName: "Victoria",
    regulator: "WorkSafe Victoria",
    primaryAct: "Occupational Health and Safety Act 2004 (Vic)",
    regulations: "Occupational Health and Safety Regulations 2017 (Vic)",
    title: "SWMS Template VIC | Free Generator for Victoria",
    metaDescription:
      "Generate a compliant Victorian SWMS in 60 seconds. References OHS Act 2004 (Vic) and OHS Regulations 2017. From $7.99.",
    h1: "Victorian SWMS Template Generator",
    intro:
      "Working on a construction job in Victoria? Victoria uses the Occupational Health and Safety Act 2004 — not the harmonised WHS framework used by most other states. Our AI generator knows the difference and produces SWMS documents with the correct Victorian legislation.",
    whyNeeded:
      "Victoria requires a SWMS for high-risk construction work under the OHS Regulations 2017, Part 5.1. While the terminology differs slightly from the national WHS framework, the requirement for a documented safe work method statement is equally strict.",
    fines:
      "WorkSafe Victoria can issue fines and improvement notices for non-compliance. Maximum penalties under the OHS Act 2004 can reach $363,480 for body corporates for serious offences.",
    cta: "Generate Your VIC SWMS",
  },
  {
    slug: "swms-template-qld",
    state: "QLD",
    stateName: "Queensland",
    regulator: "Workplace Health and Safety Queensland",
    primaryAct: "Work Health and Safety Act 2011 (Qld)",
    regulations: "Work Health and Safety Regulation 2011 (Qld)",
    title: "SWMS Template QLD | Free Generator for Queensland",
    metaDescription:
      "Generate a compliant QLD SWMS in 60 seconds. References Work Health and Safety Act 2011 (Qld). From $7.99.",
    h1: "Queensland SWMS Template Generator",
    intro:
      "Doing construction work in Queensland? Our AI generates SWMS documents that reference the Work Health and Safety Act 2011 (Qld) and WHS Regulation 2011, including all required elements for HRCW compliance.",
    whyNeeded:
      "Queensland adopted the harmonised WHS framework. A SWMS must be prepared before any high-risk construction work commences, as defined in Chapter 6, Part 3 of the WHS Regulation 2011 (Qld).",
    fines:
      "WHSQ inspectors can issue on-the-spot improvement and prohibition notices. Penalties for failure to comply with WHS duties can be significant.",
    cta: "Generate Your QLD SWMS",
  },
  {
    slug: "swms-template-wa",
    state: "WA",
    stateName: "Western Australia",
    regulator: "WorkSafe WA",
    primaryAct: "Work Health and Safety Act 2020 (WA)",
    regulations: "Work Health and Safety (General) Regulations 2022 (WA)",
    title: "SWMS Template WA | Free Generator for Western Australia",
    metaDescription:
      "Generate a compliant WA SWMS in 60 seconds. References Work Health and Safety Act 2020 (WA) and WHS General Regulations 2022. From $7.99.",
    h1: "Western Australia SWMS Template Generator",
    intro:
      "Working in Western Australia? WA adopted the harmonised WHS framework in 2022 with the Work Health and Safety Act 2020 and WHS (General) Regulations 2022. Our generator produces SWMS documents with the correct WA-specific references.",
    whyNeeded:
      "Since WA transitioned to the WHS framework in 2022, all high-risk construction work requires a SWMS under Part 6.3 of the WHS (General) Regulations 2022 (WA).",
    fines:
      "WorkSafe WA enforces SWMS requirements on construction sites. Non-compliance can result in improvement notices, prohibition notices, and financial penalties.",
    cta: "Generate Your WA SWMS",
  },
  {
    slug: "swms-template-sa",
    state: "SA",
    stateName: "South Australia",
    regulator: "SafeWork SA",
    primaryAct: "Work Health and Safety Act 2012 (SA)",
    regulations: "Work Health and Safety Regulations 2012 (SA)",
    title: "SWMS Template SA | Free Generator for South Australia",
    metaDescription:
      "Generate a compliant SA SWMS in 60 seconds. References Work Health and Safety Act 2012 (SA). From $7.99.",
    h1: "South Australia SWMS Template Generator",
    intro:
      "Need a SWMS for a South Australian job? Our AI generator creates compliant documents referencing the Work Health and Safety Act 2012 (SA) and WHS Regulations 2012.",
    whyNeeded:
      "South Australia follows the harmonised WHS framework. A SWMS is required before commencing any of the 19 categories of high-risk construction work defined in Part 6.3 of the WHS Regulations 2012 (SA).",
    fines:
      "SafeWork SA conducts regular site inspections. Failure to have a SWMS in place for HRCW can result in improvement notices and financial penalties.",
    cta: "Generate Your SA SWMS",
  },
  {
    slug: "swms-template-tas",
    state: "TAS",
    stateName: "Tasmania",
    regulator: "WorkSafe Tasmania",
    primaryAct: "Work Health and Safety Act 2012 (Tas)",
    regulations: "Work Health and Safety Regulations 2012 (Tas)",
    title: "SWMS Template TAS | Free Generator for Tasmania",
    metaDescription:
      "Generate a compliant Tasmanian SWMS in 60 seconds. References Work Health and Safety Act 2012 (Tas). From $7.99.",
    h1: "Tasmania SWMS Template Generator",
    intro:
      "Working on a Tasmanian construction site? Our AI generates SWMS documents compliant with the Work Health and Safety Act 2012 (Tas) and WHS Regulations 2012.",
    whyNeeded:
      "Tasmania follows the harmonised WHS framework. A SWMS must be prepared and followed for all high-risk construction work as defined in Part 6.3 of the WHS Regulations 2012 (Tas).",
    fines:
      "WorkSafe Tasmania enforces SWMS requirements. Non-compliance can result in enforcement action including improvement and prohibition notices.",
    cta: "Generate Your TAS SWMS",
  },
];

export const SEO_TRADE_PAGES: SeoTradePage[] = [
  {
    slug: "swms-electrician",
    trade: "Electrician",
    tradePlural: "Electricians",
    title: "SWMS for Electricians | AI-Powered Generator",
    metaDescription:
      "Generate a professional electrician SWMS in 60 seconds. Covers electrical isolation, live work, switchboard installation, cable pulling. From $7.99.",
    h1: "Electrician SWMS Generator",
    intro:
      "Electrical work is one of the most hazardous trades. Our AI generates SWMS documents specifically tailored for electrical work — covering isolation procedures, arc flash protection, EWP work, cable pulling, and switchboard installation.",
    commonHazards: [
      "Electrical shock and electrocution",
      "Arc flash and arc blast",
      "Working at heights (ceiling cavities, poles)",
      "Cable pulling strain injuries",
      "Asbestos in older switchboards",
      "Confined spaces (ceiling cavities, pits)",
    ],
    commonHrcw: [
      "Work in or near energised electrical installations or services",
      "Work at height where there is risk of a fall of more than 2 metres",
      "Confined space work",
    ],
    exampleJob:
      "Installing a new 3-phase switchboard and rewiring a commercial building. Working with 415V supply, using EWP for ceiling access at 4 metres height.",
    cta: "Generate Your Electrician SWMS",
  },
  {
    slug: "swms-plumber",
    trade: "Plumber",
    tradePlural: "Plumbers",
    title: "SWMS for Plumbers | AI-Powered Generator",
    metaDescription:
      "Generate a professional plumbing SWMS in 60 seconds. Covers trenching, hot work, confined spaces, drainage. From $7.99.",
    h1: "Plumber SWMS Generator",
    intro:
      "Plumbing work involves multiple high-risk activities from trenching to hot work to confined spaces. Our AI understands plumbing-specific hazards and generates comprehensive SWMS documents for every type of plumbing job.",
    commonHazards: [
      "Trench collapse during excavation",
      "Burns from soldering and brazing",
      "Confined space entry (manholes, pits)",
      "Exposure to sewage and biological hazards",
      "Manual handling of heavy pipes",
      "Working near underground services",
    ],
    commonHrcw: [
      "Trenches or shafts deeper than 1.5 metres",
      "Confined space work",
      "Work near pressurised gas mains or piping",
    ],
    exampleJob:
      "Replacing stormwater drainage for a residential property. Excavating a 2-metre deep trench, connecting to council main, backfilling and compacting.",
    cta: "Generate Your Plumber SWMS",
  },
  {
    slug: "swms-builder",
    trade: "Builder",
    tradePlural: "Builders",
    title: "SWMS for Builders | AI-Powered Generator",
    metaDescription:
      "Generate a professional builder SWMS in 60 seconds. Covers framing, roofing, demolition, concrete work. From $7.99.",
    h1: "Builder SWMS Generator",
    intro:
      "Builders work across almost every high-risk category — heights, demolition, structural work, mobile plant, and more. Our AI generates builder-specific SWMS documents that cover the full scope of your job.",
    commonHazards: [
      "Falls from scaffolding and roofs",
      "Struck by falling objects",
      "Manual handling of heavy materials",
      "Power tool injuries",
      "Structural collapse during demolition",
      "Mobile plant interactions",
    ],
    commonHrcw: [
      "Work at height where there is risk of a fall of more than 2 metres",
      "Demolition of load-bearing structure",
      "Structural alterations requiring temporary support",
      "Work near powered mobile plant",
    ],
    exampleJob:
      "Timber framing for a two-story residential build. Installing floor joists, wall frames, and roof trusses using a crane for heavy lifts.",
    cta: "Generate Your Builder SWMS",
  },
  {
    slug: "swms-roofer",
    trade: "Roofer",
    tradePlural: "Roofers",
    title: "SWMS for Roofers | AI-Powered Generator",
    metaDescription:
      "Generate a professional roofing SWMS in 60 seconds. Covers working at heights, fragile roofs, metal roofing, guttering. From $7.99.",
    h1: "Roofer SWMS Generator",
    intro:
      "Roofing is consistently one of the highest-risk construction trades due to working at heights. Our AI generates roofing-specific SWMS with proper fall protection controls, edge protection requirements, and weather considerations.",
    commonHazards: [
      "Falls from roof edges and through fragile surfaces",
      "Slips on wet or steep roof surfaces",
      "Heat stress and UV exposure",
      "Manual handling of roofing materials at height",
      "Power tool use at height",
      "Wind gusts destabilising workers or materials",
    ],
    commonHrcw: [
      "Work at height where there is risk of a fall of more than 2 metres",
    ],
    exampleJob:
      "Replacing a Colorbond roof on a single-story home. Removing old tiles, installing new battens and metal roofing sheets at 5 metres height.",
    cta: "Generate Your Roofer SWMS",
  },
  {
    slug: "swms-concreter",
    trade: "Concreter",
    tradePlural: "Concreters",
    title: "SWMS for Concreters | AI-Powered Generator",
    metaDescription:
      "Generate a professional concreting SWMS in 60 seconds. Covers tilt-up panels, formwork, concrete pumping. From $7.99.",
    h1: "Concreter SWMS Generator",
    intro:
      "Concrete work involves heavy machinery, chemical exposure, and high-risk activities like tilt-up panel work. Our AI generates concreting-specific SWMS that cover formwork, pouring, pumping, and finishing.",
    commonHazards: [
      "Concrete burns from wet concrete",
      "Silica dust exposure from cutting",
      "Manual handling of heavy formwork",
      "Concrete pump line whip",
      "Tilt-up panel collapse",
      "Concrete truck interactions on site",
    ],
    commonHrcw: [
      "Concrete or masonry work (tilt-up or pre-cast)",
      "Work near powered mobile plant",
    ],
    exampleJob:
      "Pouring a suspended concrete slab for a two-story commercial building. Setting up formwork, placing reinforcement, and pumping 40m3 of concrete.",
    cta: "Generate Your Concreter SWMS",
  },
  {
    slug: "swms-painter",
    trade: "Painter",
    tradePlural: "Painters",
    title: "SWMS for Painters | AI-Powered Generator",
    metaDescription:
      "Generate a professional painting SWMS in 60 seconds. Covers lead paint, working at heights, spray painting, scaffolding. From $7.99.",
    h1: "Painter SWMS Generator",
    intro:
      "Painting work often involves heights, chemical exposure, and potential lead paint hazards in older buildings. Our AI generates painting-specific SWMS with controls for scaffolding, spray painting ventilation, and hazardous substance handling.",
    commonHazards: [
      "Falls from ladders, scaffolds, and EWPs",
      "Lead paint exposure in pre-1970 buildings",
      "Chemical exposure from solvents and paints",
      "Respiratory hazards from spray painting",
      "Manual handling of paint drums",
      "Working in confined or poorly ventilated areas",
    ],
    commonHrcw: [
      "Work at height where there is risk of a fall of more than 2 metres",
      "Confined space work",
    ],
    exampleJob:
      "Exterior repainting of a two-story commercial building. Using scaffolding at 8 metres height, pressure washing old paint, applying primer and two coats.",
    cta: "Generate Your Painter SWMS",
  },
  {
    slug: "swms-welder",
    trade: "Welder",
    tradePlural: "Welders",
    title: "SWMS for Welders | AI-Powered Generator",
    metaDescription:
      "Generate a professional welding SWMS in 60 seconds. Covers MIG, TIG, stick welding, hot work permits, confined spaces. From $7.99.",
    h1: "Welder SWMS Generator",
    intro:
      "Welding involves fire risks, toxic fumes, UV radiation, and often confined space work. Our AI generates welding-specific SWMS with hot work permit requirements, ventilation controls, and fire watch procedures.",
    commonHazards: [
      "Burns from sparks and molten metal",
      "UV radiation (arc eye)",
      "Toxic fume inhalation (zinc, manganese, chromium)",
      "Fire and explosion from hot work",
      "Electric shock from welding equipment",
      "Confined space accumulation of shielding gas",
    ],
    commonHrcw: [
      "Confined space work",
      "Work in or near energised electrical installations",
    ],
    exampleJob:
      "Structural steel welding for a warehouse extension. MIG welding steel beams at 6 metres height on scaffolding, including overhead welding positions.",
    cta: "Generate Your Welder SWMS",
  },
  {
    slug: "swms-demolition",
    trade: "Demolition Worker",
    tradePlural: "Demolition Workers",
    title: "SWMS for Demolition | AI-Powered Generator",
    metaDescription:
      "Generate a professional demolition SWMS in 60 seconds. Covers structural demolition, asbestos, plant operation. From $7.99.",
    h1: "Demolition SWMS Generator",
    intro:
      "Demolition is one of the highest-risk construction activities. Our AI generates demolition-specific SWMS covering structural stability assessments, asbestos considerations, exclusion zones, and heavy plant operations.",
    commonHazards: [
      "Uncontrolled structural collapse",
      "Asbestos exposure",
      "Falling debris",
      "Dust and silica exposure",
      "Underground service strikes",
      "Heavy plant rollover and crush injuries",
    ],
    commonHrcw: [
      "Demolition of load-bearing structure",
      "Asbestos disturbance or removal",
      "Work near powered mobile plant",
      "Work at height where there is risk of a fall of more than 2 metres",
    ],
    exampleJob:
      "Partial demolition of an internal load-bearing wall in a commercial building. Propping and temporary support required, asbestos survey completed.",
    cta: "Generate Your Demolition SWMS",
  },
  {
    slug: "swms-scaffolding",
    trade: "Scaffolder",
    tradePlural: "Scaffolders",
    title: "SWMS for Scaffolding | AI-Powered Generator",
    metaDescription:
      "Generate a professional scaffolding SWMS in 60 seconds. Covers erection, modification, dismantling, edge protection. From $7.99.",
    h1: "Scaffolding SWMS Generator",
    intro:
      "Scaffolding erection and dismantling is inherently high-risk work at height. Our AI generates scaffolding-specific SWMS with proper sequence of operations, tie-off requirements, and load rating considerations.",
    commonHazards: [
      "Falls during erection and dismantling",
      "Scaffold collapse from improper setup",
      "Dropped components striking workers below",
      "Manual handling of heavy scaffold tubes",
      "Electrocution from overhead power lines",
      "Overloading of scaffold platforms",
    ],
    commonHrcw: [
      "Work at height where there is risk of a fall of more than 2 metres",
    ],
    exampleJob:
      "Erecting a 4-level scaffold system around a commercial building for external painting works. Maximum height 15 metres, requiring engineering design.",
    cta: "Generate Your Scaffolding SWMS",
  },
  {
    slug: "swms-excavation",
    trade: "Excavation Worker",
    tradePlural: "Excavation Workers",
    title: "SWMS for Excavation | AI-Powered Generator",
    metaDescription:
      "Generate a professional excavation SWMS in 60 seconds. Covers trenching, shoring, underground services, mobile plant. From $7.99.",
    h1: "Excavation SWMS Generator",
    intro:
      "Excavation work involves trench collapse risks, underground service strikes, and heavy mobile plant. Our AI generates excavation-specific SWMS with shoring requirements, Dial Before You Dig references, and spotter procedures.",
    commonHazards: [
      "Trench collapse and burial",
      "Underground service strikes (gas, electrical, water)",
      "Mobile plant rollover",
      "Workers struck by excavator",
      "Ground water ingress",
      "Undermining of adjacent structures",
    ],
    commonHrcw: [
      "Trenches or shafts deeper than 1.5 metres",
      "Work near powered mobile plant",
      "Work near pressurised gas mains or piping",
      "Work near energised electrical installations or services",
    ],
    exampleJob:
      "Excavating footings for a new residential slab. Trenches 1.8 metres deep, using a 5-tonne excavator, Dial Before You Dig completed.",
    cta: "Generate Your Excavation SWMS",
  },
  {
    slug: "swms-confined-space",
    trade: "Confined Space Worker",
    tradePlural: "Confined Space Workers",
    title: "SWMS for Confined Spaces | AI-Powered Generator",
    metaDescription:
      "Generate a professional confined space SWMS in 60 seconds. Covers atmospheric monitoring, rescue plans, entry permits. From $7.99.",
    h1: "Confined Space SWMS Generator",
    intro:
      "Confined space work is among the most dangerous construction activities. Our AI generates confined space SWMS with atmospheric monitoring requirements, entry permit procedures, standby person duties, and emergency rescue plans.",
    commonHazards: [
      "Oxygen depletion or enrichment",
      "Toxic gas accumulation (H2S, CO)",
      "Engulfment in loose materials",
      "Inability to self-rescue",
      "Ignition of flammable atmospheres",
      "Heat stress in enclosed environments",
    ],
    commonHrcw: ["Confined space work"],
    exampleJob:
      "Entry into a water storage tank for cleaning and inspection. Atmospheric monitoring required, standby person and rescue plan in place.",
    cta: "Generate Your Confined Space SWMS",
  },
];
