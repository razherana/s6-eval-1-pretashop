import type { LanguageField } from "@/pages/backoffice/home/types";
import { Decimal } from "decimal.js";

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

export function getFormattedPrice(price: number | string, currency: string, conversionChange: number, locale: string): string {
  const priceValue = typeof price === "string" ? new Decimal(price) : new Decimal(price);
  return `${currency} ${Number(priceValue.mul(new Decimal(conversionChange)).toFixed(2)).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function upperFirstLetter(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}