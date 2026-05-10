import type { LanguageField } from "@/pages/home/types";

export { LanguageProvider } from "@/providers/LanguageProvider";
export { useLanguage } from "@/hooks/useLanguage";
export type { LanguageData } from "@/contexts/LanguageContext";

export const DATABASE_LANGUAGE_ID = localStorage.getItem("languageId") ? parseInt(localStorage.getItem("languageId") as string) : 1;

export const DATABASE_CURRENCY_ID = localStorage.getItem("currencyId") ? parseInt(localStorage.getItem("currencyId") as string) : 1;

export function getWithLanguage(
  data: LanguageField,
  languageId: number,
): string {
  const languageEntry = data.language.find(
    (lang) => lang["@_id"] == languageId,
  );

  return languageEntry ? languageEntry["#text"] : "";
}

export function getFormattedPrice(price: number, currency: string, conversionChange: number, locale: string): string {
  return `${currency} ${(price * conversionChange).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}