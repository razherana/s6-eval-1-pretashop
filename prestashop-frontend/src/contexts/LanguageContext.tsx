import { createContext } from 'react';

export interface LanguageData {
  iso_name: string;
  name: string;
  currency: string;
  conversion_change: number;
  language_id: number;
  currency_id: number;
}

export interface LanguageContextType {
  language: LanguageData | null;
  setLanguage: (language: LanguageData) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
