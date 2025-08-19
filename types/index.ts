export interface VedicTextResponse {
  data: VedicText[];
}

export interface VedicText {
  _id: string;
  title: string;
  category: string;
  subCategory: string;
  description: string;
  imageUrl?: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Section {
  _id: string;
  name: string;
  number: string;
  contents: Sukta[];
}

export interface Sukta {
  _id: string;
  type: string;  // e.g., "SUKTA"
  number: string;
  contents: Mantra[];
}

export interface Mantra {
  _id: string;
  name: string;
  number: string;
  originalText: string;
  translations: Translation[];
}

export interface Translation {
  _id: string;
  language: string;      // "en", "BN", etc.
  description: string;   // translation text
}

export interface NavItem {
  id: string;
  name: string;
  icon: React.ReactElement;
  onClick: () => void;
}

export interface ReportSubmission {
  verseId: string;
  reason: string;
  feedback: string;
}
export interface Language {
  code: string;
  name: string;
}

export interface VerseTranslation {
  pada?: string;
  padartha?: string;
  bhavartha: string;
}
// Category types for filtering
export type ItemCategory = 'temple' | 'gurukul' | 'org' | 'yoga' | 'food' | 'vastu' | 'jyotish' | 'consultancy';

// Project item type for donation
export interface ProjectItem {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  raised: string;
  goal: string;
  supporters: number;
  collectedAmount: number;
  budget: number;
  deadlineDays: number;
}

export type TConsultancyService = {
  _id: string;
  imageUrl?: string;
  name: string;
  specialty: string;
  experience: string;
  category: string;
  availableTime: string;
  availabilityType: string[];
  fees: string;
  rating: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TYoga = {
  _id: string;
  name: string;
  sanskritName: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number; // in milliseconds or seconds (depending on usage)
  benefits: string[];
  contraindications: string[];
  categories: string[];
  createdBy: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
};
export interface TranslateShlokaArgs {
  text: string;
  targetLang: string;
}

// Define the expected shape of a successful response (adjust if needed)
export interface TranslateShlokaResponse {
  success: boolean;
  message: string;
  data: string; // Assuming the translation comes back as a string in the data property
}
