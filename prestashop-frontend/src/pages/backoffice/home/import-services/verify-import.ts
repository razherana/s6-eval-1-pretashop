import { isMatch } from "date-fns";
import { parseCsvFile, type FileStates } from "../services";
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
 */
export async function verifyDataForImport(
  fileStates: FileStates,
  delimiter: string,
  decimalSeparator: string,
  dateFormat: string,
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

  // Verify products import
  const csv1Rows = await parseCsvFile(fileStates.products, delimiter);
  const csv1Columns = Object.keys(csv1Rows[0] || {});
  const expectedColumns1 = COLUMNS_PER_CSV.products;
  const missingColumns1 = expectedColumns1.filter(
    (col) => !csv1Columns.includes(col),
  );

  if (missingColumns1.length > 0) {
    throw new Error(
      `Le fichier produits manque les colonnes suivantes : ${missingColumns1.join(", ")}`,
    );
  }

  // Verify date formats in products CSV
  const dateColumns1 = COLUMNS_PER_CSV_DATE_COLUMNS.products;
  for (const dateCol of dateColumns1)
    for (const row of csv1Rows) {
      const dateValue = row[dateCol];
      if (dateValue && !isMatch(dateValue, dateFormat)) {
        throw new Error(
          `Le format de la date dans la colonne "${dateCol}" est invalide : ${dateValue}`,
        );
      }
    }

  // Verify variants import
  const csv2Rows = await parseCsvFile(fileStates.variants, delimiter);
  const csv2Columns = Object.keys(csv2Rows[0] || {});
  const expectedColumns2 = COLUMNS_PER_CSV.variants;
  const missingColumns2 = expectedColumns2.filter(
    (col) => !csv2Columns.includes(col),
  );

  if (missingColumns2.length > 0) {
    throw new Error(
      `Le fichier variantes manque les colonnes suivantes : ${missingColumns2.join(", ")}`,
    );
  }

  // Verify customers import
  const csv3Rows = await parseCsvFile(fileStates.customers, delimiter);
  const csv3Columns = Object.keys(csv3Rows[0] || {});
  const expectedColumns3 = COLUMNS_PER_CSV.customers;
  const missingColumns3 = expectedColumns3.filter(
    (col) => !csv3Columns.includes(col),
  );

  if (missingColumns3.length > 0) {
    throw new Error(
      `Le fichier clients manque les colonnes suivantes : ${missingColumns3.join(", ")}`,
    );
  }

  // Verify date formats in customers CSV
  const dateColumns3 = COLUMNS_PER_CSV_DATE_COLUMNS.customers;
  for (const dateCol of dateColumns3)
    for (const row of csv3Rows) {
      const dateValue = row[dateCol];
      if (dateValue && !isMatch(dateValue, dateFormat)) {
        throw new Error(
          `Le format de la date dans la colonne "${dateCol}" est invalide : ${dateValue}`,
        );
      }
    }

  // Verify prices
  const priceColumns1 = COLUMNS_PER_CSV_PRICE_COLUMNS.products;
  for (const priceCol of priceColumns1)
    for (const row of csv1Rows) {
      const priceValue = row[priceCol];

      if (priceValue && !isValidPrice(priceValue))
        throw new Error(
          `Le prix dans la colonne "${priceCol}" est invalide : ${priceValue}`,
        );
    }

  const priceColumns2 = COLUMNS_PER_CSV_PRICE_COLUMNS.variants;
  for (const priceCol of priceColumns2)
    for (const row of csv2Rows) {
      const priceValue = row[priceCol];

      if (priceValue && !isValidPrice(priceValue))
        throw new Error(
          `Le prix dans la colonne "${priceCol}" est invalide : ${priceValue}`,
        );
    }
}

function isValidPrice(value: string): boolean {
  const normalizedValue = numeral(value).value();
  return !isNaN(normalizedValue) && normalizedValue >= 0;
}
