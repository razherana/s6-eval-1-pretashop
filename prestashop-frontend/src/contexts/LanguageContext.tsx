import type { CurrencyReadXML, LanguageReadXML } from '@/pages/backoffice/home/types';
import { createContext } from 'react';

export interface LanguageData {
  locale: string;
  language_name: string;
  currency: string;
  currency_name: string;
  conversion_change: number;
  language_id: number;
  currency_id: number;
  language_code: string;

  rawLanguages: LanguageReadXML[];
  rawCurrencies: CurrencyReadXML[];
}

export interface LanguageContextType {
  language: LanguageData;
  setLanguage: (rawLanguage: LanguageReadXML) => void;
  setCurrency: (rawCurrency: CurrencyReadXML) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
