// Aesthetic Definitions for Prompt Generation

export interface Aesthetic {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  midjourneyParams: string;
  subOptions?: Aesthetic[];
}

export const aesthetics: Aesthetic[] = [
  {
    id: "old-money",
    name: "Old Money",
    description: "Warm, grainy, timeless luxury",
    keywords: [
      "shot on 35mm film",
      "grainy texture",
      "soft warm lighting",
      "linen",
      "silk",
      "timeless elegance",
    ],
    midjourneyParams: "--stylize 250 --v 6.0 --style raw",
    subOptions: [
      {
        id: "hamptons",
        name: "Hamptons",
        description: "East Coast summer elegance",
        keywords: ["beach house", "white linen", "ocean breeze"],
        midjourneyParams: "--stylize 250 --v 6.0 --style raw",
      },
      {
        id: "paris",
        name: "Paris",
        description: "European sophistication",
        keywords: ["cobblestone", "café", "classic architecture"],
        midjourneyParams: "--stylize 250 --v 6.0 --style raw",
      },
      {
        id: "ralph-lauren",
        name: "Ralph Lauren Vibe",
        description: "Preppy American luxury",
        keywords: ["polo", "equestrian", "country club"],
        midjourneyParams: "--stylize 250 --v 6.0 --style raw",
      },
    ],
  },
  {
    id: "clean-girl",
    name: "Clean Girl",
    description: "Bright, sharp, minimalist",
    keywords: [
      "bright natural lighting",
      "sharp focus",
      "minimalist",
      "neutral tones",
      "crisp",
    ],
    midjourneyParams: "--stylize 200 --v 6.0",
  },
  {
    id: "dark-feminine",
    name: "Dark Feminine",
    description: "Moody, flash, mysterious",
    keywords: [
      "moody lighting",
      "flash photography",
      "high contrast",
      "dramatic shadows",
      "rich blacks",
    ],
    midjourneyParams: "--stylize 300 --v 6.0",
  },
  {
    id: "y2k",
    name: "Y2K",
    description: "Vibrant, film, nostalgic",
    keywords: [
      "vibrant colors",
      "film grain",
      "nostalgic",
      "early 2000s",
      "playful",
    ],
    midjourneyParams: "--stylize 150 --v 6.0",
  },
];

export interface ShotType {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export const shotTypes: ShotType[] = [
  {
    id: "pov",
    name: "POV",
    description: "First person perspective",
    keywords: ["first person", "POV", "immersive", "from above"],
  },
  {
    id: "candid",
    name: "Candid",
    description: "Walking away, natural",
    keywords: ["walking away", "back of head", "candid moment", "in motion"],
  },
  {
    id: "detail",
    name: "Detail",
    description: "Hands, accessories focus",
    keywords: ["close-up", "hands", "accessories", "detail shot", "texture"],
  },
  {
    id: "wide",
    name: "Wide",
    description: "Atmosphere, environment",
    keywords: ["wide shot", "environment", "atmosphere", "establishing shot"],
  },
];

export interface Wardrobe {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export const wardrobes: Wardrobe[] = [
  {
    id: "athleisure",
    name: "Athleisure",
    description: "Active luxury",
    keywords: ["athletic wear", "luxury sportswear", "yoga", "pilates"],
  },
  {
    id: "business-chic",
    name: "Business Chic",
    description: "Professional elegance",
    keywords: ["blazer", "tailored", "power suit", "office wear"],
  },
  {
    id: "evening-gown",
    name: "Evening Gown",
    description: "Formal elegance",
    keywords: ["evening dress", "gown", "formal", "red carpet"],
  },
  {
    id: "streetwear",
    name: "Streetwear",
    description: "Urban luxury",
    keywords: ["street style", "urban", "designer", "sneakers"],
  },
];

