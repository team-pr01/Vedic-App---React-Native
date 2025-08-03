export interface VedicText {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  sections: Section[];
  sectionLevelName?: string;
  subsectionLevelName?: string;
  verseLevelName?: string;
  imageUrl?: string;
}

export interface Section {
  id: string;
  title: string;
 contents: Subsection[];
}

export interface Subsection {
  id: string;
  title: string;
  verses: Verse[];
}

export interface Verse {
  id: string;
  sanskritLines: string[];
  devanagariLines?: string[];
  englishTranslation?: string;
  bengaliTranslation?: string;
  humanVerifiedLanguages?: string[];
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
