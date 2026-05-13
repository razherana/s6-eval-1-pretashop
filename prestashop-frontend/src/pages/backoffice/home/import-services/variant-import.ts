import { fetchFromPrestashopApi } from "@/utils/url";
import { PrestaShopXMLConverter } from "@/utils/xml";
import {
  type ImportResult,
  type ImportedRow,
  buildImportSummary,
  fetchProducts,
  fetchTaxRules,
  fetchTaxes,
  parseCsvFile,
} from "../services";
import numeral from "numeral";
import { productOptionSchema } from "@/schemas/product-option";
import { productOptionValueSchema } from "@/schemas/product-option-value";
import { combinationSchema } from "@/schemas/combination";
import { stockAvailableSchema } from "@/schemas/stock-available";
import type { TaxReadXML } from "../types";

interface ProductReferenceMap {
  [reference: string]: number; // product reference -> product ID
}

interface AttributeGroupMap {
  [groupName: string]: number; // group name -> attribute group ID
}

interface AttributeValueMap {
  [groupName: string]: {
    [valueName: string]: number; // value name -> attribute value ID
  };
}

// Add these caches at the top of the file or inside the import function
interface ProductInfoCache {
  [productId: number]: {
    taxRate: number;
    basePrice: number;
  };
}

async function getProductInfo(
  productId: number,
  cache: ProductInfoCache,
): Promise<{ taxRate: number; basePrice: number }> {
  if (cache[productId]) {
    return cache[productId];
  }

  try {
    const response = await fetchFromPrestashopApi<{
      product: {
        id_tax_rules_group: string | { "#text": string };
        price: string;
      };
    }>(`/products/${productId}?display=[id_tax_rules_group,price]`, {
      method: "GET",
    });

    const basePrice = parseFloat(response.product.price);

    const taxRulesGroupId =
      typeof response.product.id_tax_rules_group === "object"
        ? parseInt(response.product.id_tax_rules_group["#text"])
        : parseInt(response.product.id_tax_rules_group);

    let taxRate = 0;

    if (taxRulesGroupId && taxRulesGroupId > 0) {
      const taxRulesResponse = await fetchFromPrestashopApi<{
        tax_rules: {
          tax_rule: Array<{
            id_tax: string | { "#text": string };
          }>;
        };
      }>(
        `/tax_rules?display=[id_tax]&filter[id_tax_rules_group]=${taxRulesGroupId}`,
        { method: "GET" },
      );

      const taxRules = taxRulesResponse.tax_rules.tax_rule;
      const taxRulesArray = Array.isArray(taxRules) ? taxRules : [taxRules];

      if (taxRulesArray.length > 0) {
        const taxId =
          typeof taxRulesArray[0].id_tax === "object"
            ? parseInt(taxRulesArray[0].id_tax["#text"])
            : parseInt(taxRulesArray[0].id_tax);

        const taxResponse = await fetchFromPrestashopApi<{
          tax: { rate: string };
        }>(`/taxes/${taxId}?display=[rate]`, { method: "GET" });

        taxRate = parseFloat(taxResponse.tax.rate);
      }
    }

    cache[productId] = { taxRate, basePrice };
    return { taxRate, basePrice };
  } catch (error) {
    console.error(`Error fetching info for product ${productId}:`, error);
    return { taxRate: 0, basePrice: 0 };
  }
}

async function fetchAllProducts(): Promise<ProductReferenceMap> {
  try {
    const response = await fetchFromPrestashopApi<{
      products: {
        product: Array<{
          id: string;
          reference: string;
          id_tax_rules_group: string;
          price: string;
        }>;
      };
    }>("/products?display=[id,reference,id_tax_rules_group,price]", {
      method: "GET",
    });

    const products = Array.isArray(response.products.product)
      ? response.products.product
      : [response.products.product];

    const map: ProductReferenceMap = {};
    for (const product of products) {
      if (product.reference) {
        map[product.reference] = parseInt(product.id);
      }
    }
    return map;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

async function fetchStockAvailablesForProduct(
  productId: number,
): Promise<{ [combinationId: number]: number }> {
  try {
    const response = await fetchFromPrestashopApi<{
      stock_availables: {
        stock_available: Array<{
          id: string;
          id_product: string | { "#text": string };
          id_product_attribute: string | { "#text": string };
        }>;
      };
    }>(`/stock_availables?display=full&filter[id_product]=${productId}`, {
      method: "GET",
    });

    const stockAvailables = response.stock_availables.stock_available;
    const stockArray = Array.isArray(stockAvailables)
      ? stockAvailables
      : [stockAvailables];

    const map: { [combinationId: number]: number } = {};
    for (const stock of stockArray) {
      const combinationId =
        typeof stock.id_product_attribute === "object"
          ? parseInt(stock.id_product_attribute["#text"])
          : parseInt(stock.id_product_attribute);
      map[combinationId] = parseInt(stock.id);
    }
    return map;
  } catch (error) {
    console.error(
      `Error fetching stock availables for product ${productId}:`,
      error,
    );
    return {};
  }
}

async function createAttributeGroup(
  name: string,
  isColorGroup: boolean,
  languageIds: number[],
): Promise<number> {
  const converter = new PrestaShopXMLConverter(productOptionSchema, "");

  const xmlData = converter.convertRowToXML(
    languageIds.reduce<Record<string, string>>(
      (acc, langId) => {
        acc[`name;language_id=${langId}`] = name;
        acc[`public_name;language_id=${langId}`] = name;
        return acc;
      },
      {
        is_color_group: isColorGroup ? "1" : "0",
        group_type: "select",
        position: "1",
      },
    ),
  );

  try {
    const response = await fetchFromPrestashopApi<{
      product_option: { id: string };
    }>("/product_options", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });
    return parseInt(response.product_option.id);
  } catch (error) {
    console.error(`Error creating attribute group "${name}":`, error);
    throw error;
  }
}

async function createAttributeValue(
  attributeGroupId: number,
  valueName: string,
  languageIds: number[],
): Promise<number> {
  const converter = new PrestaShopXMLConverter(productOptionValueSchema, "");

  const xmlData = converter.convertRowToXML(
    languageIds.reduce<Record<string, string>>(
      (acc, langId) => {
        acc[`name;language_id=${langId}`] = valueName;
        return acc;
      },
      {
        id_attribute_group: attributeGroupId.toString(),
        position: "1",
      },
    ),
  );

  try {
    const response = await fetchFromPrestashopApi<{
      product_option_value: { id: string };
    }>("/product_option_values", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });
    return parseInt(response.product_option_value.id);
  } catch (error) {
    console.error(`Error creating attribute value "${valueName}":`, error);
    throw error;
  }
}

async function ensureAttributeGroupsExist(
  variantsData: Array<{ specificité: string; karazany: string }>,
  languageIds: number[],
): Promise<{
  attributeGroupMap: AttributeGroupMap;
  attributeValueMap: AttributeValueMap;
}> {
  // Fetch existing attribute groups
  const response = await fetchFromPrestashopApi<{
    product_options: {
      product_option: Array<{
        id: string;
        name: { language: Array<{ "@_id": string; "#text": string }> };
      }>;
    };
  }>("/product_options?display=[id,name]", { method: "GET" });

  const existingGroups = Array.isArray(response.product_options.product_option)
    ? response.product_options.product_option
    : [response.product_options.product_option];

  const attributeGroupMap: AttributeGroupMap = {};
  const attributeValueMap: AttributeValueMap = {};

  // Map existing groups
  for (const group of existingGroups) {
    const groupName = group.name.language.find(
      (l) => l["@_id"] == languageIds[0].toString(),
    )?.["#text"];
    if (groupName) {
      const groupId = parseInt(group.id);
      attributeGroupMap[groupName] = groupId;
      attributeValueMap[groupName] = {};

      // Fetch existing values for this group
      try {
        const valuesResponse = await fetchFromPrestashopApi<{
          product_option_values: {
            product_option_value: Array<{
              id: string;
              id_attribute_group: string | { "#text": string };
              name: { language: Array<{ "@_id": string; "#text": string }> };
            }>;
          };
        }>(
          `/product_option_values?display=[id,id_attribute_group,name]&filter[id_attribute_group]=${groupId}`,
          { method: "GET" },
        );

        const existingValues =
          valuesResponse.product_option_values.product_option_value;
        const valuesArray = Array.isArray(existingValues)
          ? existingValues
          : [existingValues];

        for (const value of valuesArray) {
          const valueName = value.name.language.find(
            (l) => l["@_id"] == languageIds[0].toString(),
          )?.["#text"];
          if (valueName) {
            attributeValueMap[groupName][valueName] = parseInt(value.id);
          }
        }
      } catch (error) {
        console.warn(`Could not fetch values for group "${groupName}":`, error);
      }
    }
  }

  // Create missing groups and values
  const uniqueGroups = new Set(
    variantsData.map((v) => v.specificité).filter(Boolean),
  );

  for (const groupName of uniqueGroups) {
    let groupId = attributeGroupMap[groupName];

    if (!groupId) {
      // Determine if it's a color group
      const isColor =
        groupName.toLowerCase() === "couleur" ||
        groupName.toLowerCase() === "color";
      groupId = await createAttributeGroup(groupName, isColor, languageIds);
      attributeGroupMap[groupName] = groupId;
      attributeValueMap[groupName] = {};
    }

    // Create missing values for this group
    const valuesForGroup = variantsData
      .filter((v) => v.specificité === groupName && v.karazany)
      .map((v) => v.karazany);

    for (const valueName of new Set(valuesForGroup)) {
      if (!attributeValueMap[groupName][valueName]) {
        const valueId = await createAttributeValue(
          groupId,
          valueName,
          languageIds,
        );
        attributeValueMap[groupName][valueName] = valueId;
      }
    }
  }

  return { attributeGroupMap, attributeValueMap };
}

async function createCombination(
  productId: number,
  attributeValueIds: number[],
  price: string | undefined,
  reference: string,
  productInfoCache: ProductInfoCache,
): Promise<number> {
  const converter = new PrestaShopXMLConverter(combinationSchema, "");

  const combinationRef = `${reference}_${attributeValueIds.join("_")}`;

  const data: Record<string, string> = {
    id_product: productId.toString(),
    reference: combinationRef,
    minimal_quantity: "1",
    default_on: "0",
  };

  if (price && price.trim()) {
    const prixVenteTtc = numeral(price).value();
    if (prixVenteTtc !== null && !isNaN(prixVenteTtc)) {
      // Get product info from cache
      const { taxRate, basePrice } = await getProductInfo(
        productId,
        productInfoCache,
      );

      console.log(
        `Calculating price impact for product ${productId}: prixVenteTtc=${prixVenteTtc}, taxRate=${taxRate}, basePrice=${basePrice}`,
      );

      const priceImpact = prixVenteTtc / (1 + taxRate / 100) - basePrice;

      console.log(
        `Calculated price impact for combination: ${priceImpact.toFixed(6)}`,
      );

      data.price = priceImpact.toFixed(6);
    }
  }

  data.product_option_value_ids = attributeValueIds.join(",");

  const xmlData = converter.convertRowToXML(data);

  try {
    const response = await fetchFromPrestashopApi<{
      combination: { id: string };
    }>("/combinations", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });

    return parseInt(response.combination.id);
  } catch (error) {
    console.error(
      `Error creating combination for product ${productId}:`,
      error,
    );
    throw error;
  }
}

async function createStockAvailable(
  productId: number,
  combinationId: number,
  quantity: string,
): Promise<number> {
  const converter = new PrestaShopXMLConverter(stockAvailableSchema, "");

  const xmlData = converter.convertRowToXML({
    id_product: productId.toString(),
    id_product_attribute: combinationId.toString(),
    quantity: quantity || "0",
    depends_on_stock: "0",
    out_of_stock: "1",
    id_shop: "1",
  });

  try {
    const response = await fetchFromPrestashopApi<{
      stock_available: { id: string };
    }>("/stock_availables", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });
    return parseInt(response.stock_available.id);
  } catch (error) {
    console.error(
      `Error creating stock available for product ${productId}, combination ${combinationId}:`,
      error,
    );
    throw error;
  }
}

async function updateStockAvailable(
  stockAvailableId: number,
  quantity: string,
): Promise<void> {
  const converter = new PrestaShopXMLConverter(stockAvailableSchema, "");

  const xmlData = converter.convertRowToXML({
    id: stockAvailableId.toString(),
    quantity: quantity || "0",
  });

  try {
    await fetchFromPrestashopApi("/stock_availables?ps_method=PATCH", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });
  } catch (error) {
    console.error(
      `Error updating stock for stock available ${stockAvailableId}:`,
      error,
    );
    throw error;
  }
}

async function getOrCreateStockAvailable(
  productId: number,
  combinationId: number,
  stockAvailableMap: { [combinationId: number]: number },
): Promise<number> {
  // Check if we already have the stock available ID
  if (stockAvailableMap[combinationId]) {
    return stockAvailableMap[combinationId];
  }

  // Fetch existing stock availables for this product
  const existingStocks = await fetchStockAvailablesForProduct(productId);

  if (existingStocks[combinationId]) {
    stockAvailableMap[combinationId] = existingStocks[combinationId];
    return existingStocks[combinationId];
  }

  // Should not happen, a product combination must have a stock_available, but if not, create it

  // Create new stock available
  const stockAvailableId = await createStockAvailable(
    productId,
    combinationId,
    "0",
  );
  stockAvailableMap[combinationId] = stockAvailableId;
  return stockAvailableId;
}

export async function importVariantsFromFile(
  file: File,
  delimiter: string,
  decimalSeparator: string,
  languageIds: number[] = [1, 2, 3],
): Promise<ImportResult> {
  const parsedRows = await parseCsvFile(file, delimiter);

  // Configure numeral locale
  numeral.locales["variant-import-locale"] = {
    delimiters: {
      thousands: ".",
      decimal: decimalSeparator,
    },
    abbreviations: {
      thousand: "k",
      million: "m",
      billion: "b",
      trillion: "t",
    },
    ordinal: (number: number) => (number === 1 ? "er" : "ème"),
    currency: { symbol: "€" },
  };
  numeral.locale("variant-import-locale");

  try {
    // Step 1: Fetch all products to map references to IDs
    const productMap = await fetchAllProducts();
    console.log("Product reference map:", productMap);

    const allProductsDisplayFull = await fetchProducts(100, 0);
    const allTaxRules = await fetchTaxRules(100, 0);
    const allTaxes = new Map<number, TaxReadXML>(
      (await fetchTaxes(100, 0)).map((tax) => [tax.id, tax]),
    );

    const taxRuleGroupMap: Map<
      number,
      {
        taxRate: number;
      }
    > = new Map();

    for (const taxRule of allTaxRules) {
      const taxData = taxRule.id_tax ? allTaxes.get(taxRule.id_tax) : null;
      const taxRate = taxData ? taxData.rate : 0;
      
      taxRuleGroupMap.set(taxRule.id_tax_rules_group["#text"], {
        taxRate,
      });
    }

    console.log("Tax rule group map:", taxRuleGroupMap);

    const productInfoCache: ProductInfoCache = {};
    for (const product of allProductsDisplayFull) {
      productInfoCache[product.id] = {
        taxRate: parseFloat(
          product.id_tax_rules_group
            ? taxRuleGroupMap
                .get(+product.id_tax_rules_group["#text"])
                ?.taxRate.toFixed(2) || "0"
            : "0",
        ),
        basePrice: parseFloat(product.price.toFixed(2)),
      };

      console.log(
        `Caching info for product ${product.id} (reference: ${product.reference}) : taxRate=${productInfoCache[product.id].taxRate}, basePrice=${productInfoCache[product.id].basePrice}`,
      );
    }

    // Step 2: Ensure all attribute groups and values exist
    const { attributeGroupMap, attributeValueMap } =
      await ensureAttributeGroupsExist(
        parsedRows.map((row) => ({
          specificité: row["specificité"] || "",
          karazany: row["karazany"] || "",
        })),
        languageIds,
      );
    console.log("Attribute group map:", attributeGroupMap);
    console.log("Attribute value map:", attributeValueMap);

    // Step 3: Process each variant row
    const rows: ImportedRow[] = [];

    // Cache stock available IDs by product
    const stockAvailableCache: Record<
      number,
      { [combinationId: number]: number }
    > = {};

    for (const [index, row] of parsedRows.entries()) {
      const reference = row.reference;
      const specificité = row["specificité"];
      const karazany = row.karazany;
      const stockInitial = row.stock_initial || "0";
      const prixVenteTtc = row.prix_vente_ttc;

      // Validate required fields
      if (!reference) {
        rows.push({
          index: index + 1,
          data: row,
          success: false,
          error: "Missing reference",
        });
        continue;
      }

      // Check if product exists
      const productId = productMap[reference];
      if (!productId) {
        rows.push({
          index: index + 1,
          data: row,
          success: false,
          error: `Product with reference "${reference}" not found. Import products first.`,
        });
        continue;
      }

      // Initialize stock cache for this product
      if (!stockAvailableCache[productId]) {
        stockAvailableCache[productId] = {};
      }

      // Handle case where no variant attributes (just stock update for base product)
      if (!specificité && !karazany) {
        try {
          const stockAvailableId = await getOrCreateStockAvailable(
            productId,
            0, // id_product_attribute = 0 for default combination
            stockAvailableCache[productId],
          );
          await updateStockAvailable(stockAvailableId, stockInitial);

          rows.push({
            index: index + 1,
            data: row,
            success: true,
            warnings: ["Stock updated for base product (no variants)"],
          });
        } catch (error) {
          rows.push({
            index: index + 1,
            data: row,
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to update stock",
          });
        }
        continue;
      }

      // Get attribute value IDs
      const attributeValueIds: number[] = [];

      if (specificité && karazany) {
        const groupId = attributeGroupMap[specificité];
        if (!groupId) {
          rows.push({
            index: index + 1,
            data: row,
            success: false,
            error: `Attribute group "${specificité}" not found`,
          });
          continue;
        }

        const valueId = attributeValueMap[specificité]?.[karazany];
        if (!valueId) {
          rows.push({
            index: index + 1,
            data: row,
            success: false,
            error: `Attribute value "${karazany}" not found for group "${specificité}"`,
          });
          continue;
        }

        attributeValueIds.push(valueId);
      }

      try {
        // Create combination (PrestaShop auto-creates stock_available)
        const combinationId = await createCombination(
          productId,
          attributeValueIds,
          prixVenteTtc,
          reference,
          productInfoCache,
        );

        // Now fetch the stock_available ID that was auto-created
        const stockAvailableId = await getOrCreateStockAvailable(
          productId,
          combinationId,
          stockAvailableCache[productId],
        );

        // Update stock quantity
        await updateStockAvailable(stockAvailableId, stockInitial);

        rows.push({
          index: index + 1,
          data: row,
          success: true,
        });
      } catch (error) {
        rows.push({
          index: index + 1,
          data: row,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create combination",
        });
      }
    }

    return {
      summary: buildImportSummary("Variants", file.name, rows),
      rows,
    };
  } catch (error) {
    console.error("Error in variant import:", error);
    return {
      summary: {
        step: "Variants",
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
        error:
          "Failed to process variants: " +
          (error instanceof Error ? error.message : String(error)),
      })),
    };
  }
}
