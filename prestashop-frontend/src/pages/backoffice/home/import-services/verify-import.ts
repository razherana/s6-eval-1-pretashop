import { isMatch } from "date-fns";
import { parseCsvFile, type FileStates, type ImportMode } from "../services";
import numeral from "numeral";

export const COLUMNS_PER_CSV: { [key: string]: string[] } = {
  products: [
    "date_availability_produit",
    "nom",
    "reference",
    "prix_ttc",
    "Taxe",
    "categorie",
    "prix_achat",
  ],
  variants: [
    "reference",
    "specificité",
    "karazany",
    "stock_initial",
    "prix_vente_ttc",
  ],
  customers: ["date", "nom", "email", "pwd", "adresse", "achat", "etat"],
};

export const COLUMNS_PER_CSV_DATE_COLUMNS: { [key: string]: string[] } = {
  products: ["date_availability_produit"],
  customers: ["date"],
};

export const COLUMNS_PER_CSV_PRICE_COLUMNS: { [key: string]: string[] } = {
  products: ["prix_ttc", "prix_achat"],
  variants: ["prix_vente_ttc"],
};

async function validateCsvFile(
  file: File | null,
  fileType: "products" | "variants" | "customers",
  delimiter: string,
  dateFormat: string,
): Promise<void> {
  if (!file) {
    throw new Error(
      `Le fichier ${fileType === "products" ? "produits" : fileType === "variants" ? "variantes" : "clients"} est requis pour cette importation.`,
    );
  }

  const rows = await parseCsvFile(file, delimiter);
  const columns = Object.keys(rows[0] || {});
  const expectedColumns = COLUMNS_PER_CSV[fileType];
  const missingColumns = expectedColumns.filter(
    (col) => !columns.includes(col),
  );

  if (missingColumns.length > 0) {
    const label =
      fileType === "products"
        ? "produits"
        : fileType === "variants"
          ? "variantes"
          : "clients";
    throw new Error(
      `Le fichier ${label} manque les colonnes suivantes : ${missingColumns.join(", ")}`,
    );
  }

  // Verify date formats
  const dateColumns = COLUMNS_PER_CSV_DATE_COLUMNS[fileType] || [];
  for (const dateCol of dateColumns) {
    for (const row of rows) {
      const dateValue = row[dateCol];
      if (dateValue && !isMatch(dateValue, dateFormat)) {
        throw new Error(
          `Le format de la date dans la colonne "${dateCol}" est invalide : ${dateValue}`,
        );
      }
    }
  }

  // Verify prices
  const priceColumns = COLUMNS_PER_CSV_PRICE_COLUMNS[fileType] || [];
  for (const priceCol of priceColumns) {
    for (const row of rows) {
      const priceValue = row[priceCol];
      if (priceValue && !isValidPrice(priceValue)) {
        throw new Error(
          `Le prix dans la colonne "${priceCol}" est invalide : ${priceValue}`,
        );
      }
    }
  }
}

/**
 * Verify data and configurations before starting the import process. Throws an error if any issues are found.
 * This checks :
 * - name of columns in the CSV files
 * - format of date columns
 * - positive prices
 *
 * @param fileStates
 * @param delimiter
 * @param decimalSeparator
 * @param mode - Which files to validate (default "all")
 */
export async function verifyDataForImport(
  fileStates: FileStates,
  delimiter: string,
  decimalSeparator: string,
  dateFormat: string,
  mode: ImportMode = "all",
): Promise<void> {
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

  if (mode === "all" || mode === "products-variants") {
    await validateCsvFile(
      fileStates.products,
      "products",
      delimiter,
      dateFormat,
    );
    await validateCsvFile(
      fileStates.variants,
      "variants",
      delimiter,
      dateFormat,
    );
  }

  if (mode === "all" || mode === "customers") {
    await validateCsvFile(
      fileStates.customers,
      "customers",
      delimiter,
      dateFormat,
    );
  }
}

function isValidPrice(value: string): boolean {
  const normalizedValue = numeral(value).value();
  if (normalizedValue === null) return false;
  return !isNaN(normalizedValue) && normalizedValue >= 0;
}
