// Trade types for SEO landing pages and UI

export interface TradeInfo {
  slug: string;
  name: string;
  description: string;
  common_hrcw_ids: number[];
  common_hazards: string[];
}

export const TRADES: TradeInfo[] = [
  {
    slug: "electrician",
    name: "Electrician",
    description: "Electrical installation, maintenance, and repair work",
    common_hrcw_ids: [7, 1, 11],
    common_hazards: [
      "Electrical shock or electrocution",
      "Arc flash burns",
      "Falls from ladders or heights",
      "Cable damage and short circuits",
      "Working in confined ceiling spaces",
    ],
  },
  {
    slug: "plumber",
    name: "Plumber",
    description: "Plumbing, drainage, gas fitting, and roofing work",
    common_hrcw_ids: [5, 6, 1, 19],
    common_hazards: [
      "Exposure to sewage and biological hazards",
      "Gas leaks and explosions",
      "Falls from roofs",
      "Trench collapse during drainage work",
      "Burns from hot water systems",
    ],
  },
  {
    slug: "builder",
    name: "Builder",
    description: "Residential and commercial building construction",
    common_hrcw_ids: [1, 11, 15, 17],
    common_hazards: [
      "Falls from scaffolding or upper levels",
      "Struck by falling objects",
      "Structural collapse during construction",
      "Heavy machinery interaction",
      "Manual handling injuries",
    ],
  },
  {
    slug: "roofer",
    name: "Roofer",
    description: "Roof installation, repair, and maintenance",
    common_hrcw_ids: [1, 8],
    common_hazards: [
      "Falls from roof edges or through fragile roofing",
      "Heat stress and sunburn",
      "Falling tools and materials",
      "Slips on wet or steep surfaces",
      "Manual handling of heavy sheets",
    ],
  },
  {
    slug: "concreter",
    name: "Concreter",
    description: "Concrete pouring, finishing, and structural work",
    common_hrcw_ids: [15, 11, 19],
    common_hazards: [
      "Chemical burns from wet concrete",
      "Silica dust inhalation",
      "Crushing by concrete pump or agitator",
      "Formwork collapse",
      "Manual handling of heavy materials",
    ],
  },
  {
    slug: "painter",
    name: "Painter",
    description: "Interior and exterior painting and surface preparation",
    common_hrcw_ids: [1, 4],
    common_hazards: [
      "Falls from ladders and scaffolding",
      "Exposure to paint fumes and solvents",
      "Lead paint disturbance in older buildings",
      "Asbestos disturbance during preparation",
      "Repetitive strain from overhead work",
    ],
  },
  {
    slug: "welder",
    name: "Welder",
    description: "Welding, cutting, and metal fabrication",
    common_hrcw_ids: [1, 8, 18],
    common_hazards: [
      "Burns from welding arc and hot metal",
      "UV radiation eye damage",
      "Toxic fume inhalation",
      "Fire and explosion from flammable materials",
      "Electric shock from welding equipment",
    ],
  },
  {
    slug: "demolition",
    name: "Demolition",
    description: "Structural demolition and deconstruction",
    common_hrcw_ids: [3, 4, 1, 7, 11],
    common_hazards: [
      "Uncontrolled structural collapse",
      "Asbestos exposure",
      "Falling debris",
      "Contact with live services",
      "Dust and noise exposure",
    ],
  },
  {
    slug: "scaffolding",
    name: "Scaffolding",
    description: "Scaffold erection, modification, and dismantling",
    common_hrcw_ids: [1, 11],
    common_hazards: [
      "Falls during erection or dismantling",
      "Scaffold collapse from overloading",
      "Falling tools and components",
      "Contact with overhead power lines",
      "Manual handling of heavy scaffold tubes",
    ],
  },
  {
    slug: "excavation",
    name: "Excavation",
    description: "Earthworks, trenching, and excavation",
    common_hrcw_ids: [19, 11, 5, 7],
    common_hazards: [
      "Trench collapse and burial",
      "Striking underground services",
      "Falling into excavation",
      "Plant and pedestrian interaction",
      "Unstable ground near excavation edge",
    ],
  },
  {
    slug: "confined-space",
    name: "Confined Space",
    description: "Work in confined spaces including tanks, pits, and vaults",
    common_hrcw_ids: [18, 9],
    common_hazards: [
      "Atmospheric hazards (toxic gas, oxygen deficiency)",
      "Engulfment",
      "Restricted entry and exit",
      "Explosion from flammable atmospheres",
      "Communication difficulties",
    ],
  },
];

export const TRADE_SLUGS = TRADES.map((t) => t.slug);
