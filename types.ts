
export interface ProductCatalogItem {
  id?: string;
  userId: string;
  storeName: string;
  productName: string;
  productLink: string;
  description: string;
  createdAt: any;
}

export interface ContentStrategy {
  id?: string;
  userId: string;
  title: string;
  hook: string;
  example: string;
  createdAt: any;
}

export interface MainBrain {
  id?: string;
  userId: string;
  title: string; // Added title for identifying different brains
  instruction: string;
  createdAt: any;
}

export interface GeneratedCaptionData {
  id?: string;
  userId: string;
  // Snapshot data at the time of generation
  storeName: string;
  productName: string;
  productLink: string;
  tone: string;
  strategyTitle?: string; // Snapshot of strategy name
  generatedCaption: string;
  hashtags: string[];
  createdAt: any;
}

export enum ToneType {
  PROFESSIONAL = 'Profesional',
  FUN = 'Lucu & Santai',
  PERSUASIVE = 'Persuasif (Jualan)',
  LUXURY = 'Mewah & Elegan',
  EDUCATIONAL = 'Edukatif'
}

export interface GeneratedContent {
  caption: string;
  hashtags: string[];
}