// The 19 High-Risk Construction Work categories
// WHS Regulations 2011, Regulation 291

export interface HrcwCategory {
  id: number;
  description: string;
  short_label: string;
}

export const HRCW_CATEGORIES: HrcwCategory[] = [
  {
    id: 1,
    description:
      "Work at height where there is risk of a fall of more than 2 metres",
    short_label: "Work at height (>2m fall risk)",
  },
  {
    id: 2,
    description: "Work on telecommunications towers",
    short_label: "Telecommunications towers",
  },
  {
    id: 3,
    description: "Demolition of load-bearing structure",
    short_label: "Demolition (load-bearing)",
  },
  {
    id: 4,
    description: "Disturbing or removing asbestos",
    short_label: "Asbestos disturbance/removal",
  },
  {
    id: 5,
    description:
      "Work in or near pressurised gas distribution mains or piping",
    short_label: "Pressurised gas mains/piping",
  },
  {
    id: 6,
    description: "Work in or near chemical, fuel or refrigerant lines",
    short_label: "Chemical/fuel/refrigerant lines",
  },
  {
    id: 7,
    description:
      "Work in or near energised electrical installations or services",
    short_label: "Energised electrical",
  },
  {
    id: 8,
    description: "Work in areas with artificial extremes of temperature",
    short_label: "Extreme temperature",
  },
  {
    id: 9,
    description: "Work in or near bore holes or shafts",
    short_label: "Bore holes/shafts",
  },
  {
    id: 10,
    description:
      "Work on or near roads or railways used by road or rail traffic",
    short_label: "Near roads/railways",
  },
  {
    id: 11,
    description: "Work in areas with movement of powered mobile plant",
    short_label: "Powered mobile plant",
  },
  {
    id: 12,
    description:
      "Work in an area where there are artificial extremes of air pressure",
    short_label: "Extreme air pressure",
  },
  {
    id: 13,
    description:
      "Work in or near water or other liquid that involves risk of drowning",
    short_label: "Drowning risk (water/liquid)",
  },
  {
    id: 14,
    description: "Diving work",
    short_label: "Diving work",
  },
  {
    id: 15,
    description:
      "Work involving concrete or masonry structures (tilt-up or pre-cast)",
    short_label: "Tilt-up/pre-cast concrete",
  },
  {
    id: 16,
    description: "Work in tunnels",
    short_label: "Tunnel work",
  },
  {
    id: 17,
    description:
      "Work involving structural alterations requiring temporary support",
    short_label: "Structural alterations (temp support)",
  },
  {
    id: 18,
    description: "Work in confined spaces",
    short_label: "Confined spaces",
  },
  {
    id: 19,
    description: "Work in or near trenches or shafts deeper than 1.5 metres",
    short_label: "Trenches/shafts (>1.5m)",
  },
];

export const HRCW_IDS = HRCW_CATEGORIES.map((c) => c.id);
