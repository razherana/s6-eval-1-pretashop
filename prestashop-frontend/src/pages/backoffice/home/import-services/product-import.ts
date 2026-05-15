import productSchema from "@/schemas/product";
import categorySchema from "@/schemas/category";
import { taxRuleGroupSchema, taxRuleSchema, taxSchema } from "@/schemas/tax";
import { fetchFromPrestashopApi } from "@/utils/url";
import { PrestaShopXMLConverter } from "@/utils/xml";
import {
  type ImportResult,
  type ImportedRow,
  createProduct,
  buildImportSummary,
  parseCsvFile,
} from "../services";
import type { CategoryReadXML } from "../types";
import { parse } from "date-fns";

import numeral from "numeral";
import { utc } from "@date-fns/utc";

// Import step 1
interface CategoryMap {
  [categoryName: string]: number; // category name -> category ID
}

interface TaxMap {
  [percentage: string]: {
    taxId: number;
    taxRuleGroupId: number;
    taxRuleIds: Record<string, number>; // country ISO -> tax_rule ID
  };
}

async function fetchAllCategories(): Promise<CategoryReadXML[]> {
  try {
    const response = await fetchFromPrestashopApi<{
      categories: { category: CategoryReadXML[] };
    }>("/categories?display=full", { method: "GET" });
    return response.categories.category;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

async function createCategory(
  name: string,
  languageIds: number[],
): Promise<number> {
  const converter = new PrestaShopXMLConverter(categorySchema, "");

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const xmlData = converter.convertRowToXML(
    languageIds.reduce<Record<string, string>>(
      (acc, langId) => {
        acc[`name;language_id=${langId}`] = name;
        acc[`link_rewrite;language_id=${langId}`] = slug;
        return acc;
      },
      {
        active: "1",
        id_parent: "2",
      },
    ),
  );

  try {
    const response = await fetchFromPrestashopApi<{ category: { id: string } }>(
      "/categories",
      {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: xmlData,
      },
    );
    return parseInt(response.category.id);
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

/**
 * Ensures that all categories from the CSV exist in PrestaShop, creating any that are missing.
 *
 * @param categoryNames
 * @param languageIds
 * @returns
 */
async function ensureCategoriesExist(
  categoryNames: string[],
  languageIds: number[],
): Promise<CategoryMap> {
  const existingCategories = await fetchAllCategories();
  const categoryMap: CategoryMap = {};

  console.log(
    "Existing categories fetched from PrestaShop:",
    existingCategories,
  );

  // Create a map of existing categories (using name from first language)
  for (const cat of existingCategories) {
    const catName = cat.name.language.find(
      (l) => l["@_id"] == languageIds[0],
    )?.["#text"];
    if (catName) {
      categoryMap[catName] = cat.id;
    }
  }

  // Create missing categories
  for (const name of categoryNames) {
    if (!categoryMap[name]) {
      console.log(`Creating category: ${name}`);
      const newCategoryId = await createCategory(name, languageIds);
      categoryMap[name] = newCategoryId;
    }
  }

  return categoryMap;
}

async function createTax(
  percentage: string,
  languageIds: number[],
): Promise<{ taxId: number; name: string }> {
  const taxName = `Tax ${percentage}`;
  const converter = new PrestaShopXMLConverter(taxSchema, "");

  numeral.locale("product-import-locale");

  const xmlData = converter.convertRowToXML(
    languageIds.reduce<Record<string, string>>(
      (acc, langId) => {
        acc[`name;language_id=${langId}`] = taxName;
        return acc;
      },
      {
        rate: String(numeral(percentage.replace("%", "")).value()),
        active: "1",
        deleted: "0",
      },
    ),
  );

  try {
    const response = await fetchFromPrestashopApi<{ tax: { id: string } }>(
      "/taxes",
      {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: xmlData,
      },
    );
    return { taxId: parseInt(response.tax.id), name: taxName };
  } catch (error) {
    console.error("Error creating tax:", error);
    throw error;
  }
}

async function createTaxRuleGroup(name: string): Promise<number> {
  const converter = new PrestaShopXMLConverter(taxRuleGroupSchema, "");
  const xmlData = converter.convertRowToXML({
    name,
    active: "1",
  });

  try {
    const response = await fetchFromPrestashopApi<{
      tax_rule_group: { id: string };
    }>("/tax_rule_groups", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });

    console.log(`Created tax rule group "${name}" :`, response.tax_rule_group);

    return parseInt(response.tax_rule_group.id);
  } catch (error) {
    console.error("Error creating tax rule group:", error);
    throw error;
  }
}

async function createTaxRule(
  taxRuleGroupId: number,
  taxId: number,
  countryId: number,
): Promise<number> {
  const converter = new PrestaShopXMLConverter(taxRuleSchema, "");
  const xmlData = converter.convertRowToXML({
    id_tax_rules_group: taxRuleGroupId.toString(),
    id_country: countryId.toString(),
    id_tax: taxId.toString(),
    behavior: "0",
  });

  try {
    const response = await fetchFromPrestashopApi<{ tax_rule: { id: string } }>(
      "/tax_rules",
      {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: xmlData,
      },
    );
    return parseInt(response.tax_rule.id);
  } catch (error) {
    console.error("Error creating tax rule:", error);
    throw error;
  }
}

const TAX_PRECISION = 6;

async function ensureTaxesExist(
  taxPercentages: string[],
  languageIds: number[],
): Promise<TaxMap> {
  const taxMap: TaxMap = {};

  // Fetch actual countries first
  const countryIds: number[] = [8, 133, 21]; // Default to some countries (France, Madagascar, US)

  numeral.locale("product-import-locale");

  for (const percentage of taxPercentages) {
    const cleanPercentage = numeral(percentage.replace("%", "").trim()).value();
    const cleanPercentageStr = cleanPercentage?.toFixed(TAX_PRECISION) || "0";

    if (!taxMap[cleanPercentageStr]) {
      // Create tax
      const { taxId } = await createTax(percentage, languageIds);

      // Create tax rule group
      const taxRuleGroupId = await createTaxRuleGroup(`Tax Rule ${percentage}`);

      // Create tax rules for each country
      const taxRuleIds: Record<string, number> = {};
      for (const countryId of countryIds) {
        const taxRuleId = await createTaxRule(taxRuleGroupId, taxId, countryId);
        taxRuleIds[countryId.toString()] = taxRuleId;
      }

      taxMap[cleanPercentage] = {
        taxId,
        taxRuleGroupId,
        taxRuleIds,
      };
    }
  }

  return taxMap;
}

export async function importProductsFromFile(
  file: File,
  delimiter: string,
  decimalSeparator: string,
  languageIds: number[],
  dateFormat: string
): Promise<ImportResult & { availableDateReferenceMap : Record<string, string> }> {
  const parsedRows = await parseCsvFile(file, delimiter);
  const converter = new PrestaShopXMLConverter(productSchema, "");
  const rows: ImportedRow[] = [];
  const availableDateReferenceMap: Record<string, string> = {};

  const customLocale = {
    delimiters: {
      thousands: ".", // Thousands separator
      decimal: decimalSeparator,
    },
    abbreviations: {
      thousand: "k",
      million: "m",
      billion: "b",
      trillion: "t",
    },
    ordinal: function (number: number): string {
      return number === 1 ? "er" : "ème"; // An example for French ordinals
    },
    currency: {
      symbol: "€", // Example currency symbol
    },
  };

  numeral.locales["product-import-locale"] = customLocale;

  numeral.locale("product-import-locale");

  // Step 1: Extract unique categories and taxes
  const categoryNames = new Set<string>();
  const taxPercentages = new Set<string>();

  for (const row of parsedRows) {
    if (row.categorie) categoryNames.add(row.categorie);

    if (row.Taxe) taxPercentages.add(row.Taxe);
  }

  // Step 2: Ensure all categories exist
  let categoryMap: CategoryMap;
  let taxMap: TaxMap;

  console.log("Unique categories from CSV:", Array.from(categoryNames));
  console.log("language ids : ", languageIds);

  try {
    categoryMap = await ensureCategoriesExist(
      Array.from(categoryNames),
      languageIds,
    );
    console.log("Category map:", categoryMap);

    // Step 3: Ensure all taxes exist
    taxMap = await ensureTaxesExist(Array.from(taxPercentages), languageIds);
    console.log("Tax map:", taxMap);
  } catch (error) {
    console.error("Error preparing categories/taxes:", error);
    // If we can't create categories/taxes, mark all rows as failed
    return {
      summary: {
        step: "Products",
        fileName: file.name,
        totalRows: parsedRows.length,
        successCount: 0,
        failedCount: parsedRows.length,
        warnings: 0,
      },
      rows: parsedRows.map((row, index) => ({
        index: index + 1,
        data: row,
        success: false,
        error: "Failed to prepare categories and taxes",
      })),
      availableDateReferenceMap: {},
    };
  }

  numeral.locale("product-import-locale");

  // Step 4: Process each product
  for (const [index, row] of parsedRows.entries()) {
    console.log(`Processing row ${index + 1}:`, row);
    try {
      const cleanTax = row.Taxe
        ? (numeral(row.Taxe.replace("%", "").trim()).value() ?? 0).toFixed(
            TAX_PRECISION,
          )
        : "0";

      // Map CSV fields to schema fields
      const productData: Record<string, string> = {
        wholesale_price: (numeral(row.prix_achat || "0").value() || 0).toFixed(
          6,
        ),
        price: (
          (numeral(row.prix_ttc || "0").value() || 0) /
          (1 + (taxMap[cleanTax]?.taxId ? parseFloat(cleanTax) / 100 : 0))
        ).toFixed(6),
        available_date: parse(row.date_availability_produit, dateFormat, new Date(), { in: utc })
          .toISOString()
          .split("T")[0],
        reference: row.reference || "",
        state: "1",
        active: "1",
        available_for_order: "1",
        show_price: "1",
        visibility: "both",
        condition: "new",
        minimal_quantity: "1",
      };

      availableDateReferenceMap[row.reference] = productData.available_date;

      // Set name for all languages
      if (row.nom) {
        languageIds.forEach((langId) => {
          productData[`name;language_id=${langId}`] = row.nom;
        });
      }

      // Set category
      if (row.categorie && categoryMap[row.categorie]) {
        productData.id_category_default = categoryMap[row.categorie].toString();
        productData.categorie = categoryMap[row.categorie].toString();
      }

      // Set tax
      if (row.Taxe) {
        console.log(
          `Row ${index + 1} tax percentage: ${cleanTax}. Tax map entry:`,
          taxMap[cleanTax],
        );
        if (taxMap[cleanTax]) {
          productData.id_tax_rules_group =
            taxMap[cleanTax].taxRuleGroupId.toString();
        }
      }

      // Convert and create product
      const xmlData = converter.convertRowToXML(productData);
      console.log(`Creating product ${index + 1} with XML:`, xmlData);

      await createProduct(productData, converter);

      rows.push({
        index: index + 1,
        data: row,
        success: true,
      });
    } catch (error) {
      console.error(`Error importing product at row ${index + 1}:`, error);
      rows.push({
        index: index + 1,
        data: row,
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create product",
      });
    }
  }

  return {
    summary: buildImportSummary("Products", file.name, rows),
    rows,
    availableDateReferenceMap,
  };
}
