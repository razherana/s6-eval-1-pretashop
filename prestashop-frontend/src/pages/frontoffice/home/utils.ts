// src/pages/frontoffice/home/utils.ts
import { getWithLanguage } from "@/utils/lang";
import type { FrontofficeData } from "./services";
import type { CombinationDetailXML } from "@/pages/backoffice/home/types";

export interface CombinationWithDetails {
  id: number;
  reference: string;
  price: number;
  ean13?: string;
  upc?: string;
  minimal_quantity: number;
  attributeNames: string[];
}

export function getCombinationsForProduct(
  productId: number,
  data: FrontofficeData,
): CombinationDetailXML[] {
  return data.combinationsCache.get(productId) || [];
}

export function getCategoryName(
  categoryId: number,
  data: FrontofficeData,
  languageId: number,
): string {
  const category = data.categories.find((c) => c.id === categoryId);
  if (!category) return `Category #${categoryId}`;
  return getWithLanguage(category.name, languageId);
}
