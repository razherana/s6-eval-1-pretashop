import { fetchFromPrestashopApi } from "@/utils/url";
import { PrestaShopXMLConverter } from "@/utils/xml";
import {
  type ImportResult,
  type ImportedRow,
  buildImportSummary,
  parseCsvFile,
} from "../services";
import { customerSchema } from "@/schemas/customer";

const USER_GROUP_ACCESS = [1, 2, 3];

interface CustomerEmailMap {
  [email: string]: number; // email -> customer ID
}

async function fetchAllCustomers(): Promise<CustomerEmailMap> {
  try {
    const response = await fetchFromPrestashopApi<{
      customers: {
        customer: Array<{
          id: string;
          email: string;
        }>;
      };
    }>("/customers?display=[id,email]", { method: "GET" });

    const customers = Array.isArray(response.customers.customer)
      ? response.customers.customer
      : response.customers.customer
        ? [response.customers.customer]
        : [];

    const map: CustomerEmailMap = {};
    for (const customer of customers) 
      if (customer.email) 
        map[customer.email] = parseInt(customer.id);
    
    return map;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
}

async function createCustomer(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): Promise<number> {
  const converter = new PrestaShopXMLConverter(customerSchema, "");

  const xmlData = converter.convertRowToXML({
    firstname: firstName,
    lastname: lastName,
    email: email,
    passwd: password,
    id_lang: "1",
    active: "1",
    newsletter: "0",
    optin: "0",
    newsletter_date_add: "0000-00-00 00:00:00",
    groups: USER_GROUP_ACCESS.join(","),
  });

  try {
    const response = await fetchFromPrestashopApi<{
      customer: { id: string };
    }>("/customers", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlData,
    });
    return parseInt(response.customer.id);
  } catch (error) {
    console.error(`Error creating customer "${email}":`, error);
    throw error;
  }
}

/**
 * Parse the "achat" column format:
 * [("REF";QTY;"ATTRIBUTE"),("REF";QTY;"ATTRIBUTE")]
 *
 * Returns an array of parsed purchase items
 */
function parseAchatColumn(
  achat: string,
): Array<{ reference: string; quantity: number; attribute: string }> {
  if (!achat || !achat.trim()) {
    return [];
  }

  const items: Array<{
    reference: string;
    quantity: number;
    attribute: string;
  }> = [];

  try {
    // Remove outer brackets and split by "),("
    const cleanStr = achat.replace(/^\[|\]$/g, "");
    const itemStrings = cleanStr.split(/\),\(/);

    for (const itemStr of itemStrings) {
      // Clean up the string and split by semicolon
      const cleanItem = itemStr.replace(/[()""]/g, "").trim();
      const parts = cleanItem.split(";").map((p) => p.trim());

      if (parts.length >= 2) {
        items.push({
          reference: parts[0],
          quantity: parseInt(parts[1]) || 1,
          attribute: parts[2] || "",
        });
      }
    }
  } catch (error) {
    console.warn("Error parsing achat column:", achat, error);
  }

  return items;
}

/**
 * Placeholder for handling orders/purchases
 * Will be implemented later
 */
async function handleCustomerOrders(
  customerId: number,
  achatData: string,
  purchaseStatus: string,
): Promise<void> {
  const parsedItems = parseAchatColumn(achatData);

  console.log(
    `Customer ${customerId} purchases (status: ${purchaseStatus}):`,
    parsedItems,
  );

  // TODO: Implement order creation
  // 1. Create a cart for the customer
  // 2. Add products to the cart (resolve references to product IDs, handle attributes)
  // 3. Create the order from the cart
  // 4. Set order status based on "etat" column

  // For now, just log the parsed data
  if (parsedItems.length > 0) {
    console.log(
      `Parsed ${parsedItems.length} items for customer ${customerId}`,
    );
  }
}

/**
 * Placeholder for handling order status
 * Will be implemented later
 */
async function handleOrderStatus(
  customerId: number,
  status: string,
): Promise<void> {
  console.log(`Customer ${customerId} order status: ${status}`);

  const statusMap: Record<string, number> = {
    "en attente paiement à la livraison": 1, // Waiting for payment
    "paiement accepté": 2, // Payment accepted
    "erreur de paiement": 8, // Payment error
    "en attente": 1,
    payé: 2,
    erreur: 8,
  };

  const statusId = statusMap[status.toLowerCase()] || 1;
  console.log(`Mapped status "${status}" to status ID: ${statusId}`);

  // TODO: Implement order status update
  // Need to find the latest order for this customer and update its status
}

export async function importCustomersFromFile(
  file: File,
  delimiter: string,
  _decimalSeparator: string,
  _languageIds: number[] = [1, 2, 3],
): Promise<ImportResult> {
  const parsedRows = await parseCsvFile(file, delimiter);

  try {
    // Step 1: Fetch existing customers to check for duplicates
    const existingCustomers = await fetchAllCustomers();
    console.log("Existing customer emails:", Object.keys(existingCustomers));

    // Step 2: Process each customer row
    const rows: ImportedRow[] = [];

    for (const [index, row] of parsedRows.entries()) {
      const nom = row.nom;
      const email = row.email;
      const password = row.pwd;
      const adresse = row.adresse;
      const achat = row.achat;
      const etat = row.etat;

      // Validate required fields
      if (!nom) {
        rows.push({
          index: index + 1,
          data: row,
          success: false,
          error: "Missing name (nom)",
        });
        continue;
      }

      if (!email) {
        rows.push({
          index: index + 1,
          data: row,
          success: false,
          error: "Missing email",
        });
        continue;
      }

      if (!password) {
        rows.push({
          index: index + 1,
          data: row,
          success: false,
          error: "Missing password (pwd)",
        });
        continue;
      }

      try {
        // Split name into firstname and lastname
        const nameParts = nom.trim().split(/\s+/);
        const firstName = nameParts[0] || nom;
        const lastName = nameParts.slice(1).join(" ") || nom;

        let customerId: number;
        const warnings: string[] = [];

        // Check if customer already exists
        const existingCustomerId = existingCustomers[email];

        if (!existingCustomerId) {
          // Create new customer
          console.log(`Creating new customer "${email}"`);
          customerId = await createCustomer(
            firstName,
            lastName,
            email,
            password,
          );
          // Add to existing customers map to avoid duplicates within the same import
          existingCustomers[email] = customerId;
        } else {
          // Do something else
        }

        // Store address (if needed, could be added to customer or used for orders)
        if (adresse) {
          console.log(`Customer ${customerId} address: ${adresse}`);
          // TODO: Could update customer address if schema supports it,
          // or store it for order creation
        }

        // Handle purchases (placeholder)
        if (achat) {
          await handleCustomerOrders(customerId, achat, etat);
        }

        // Handle order status (placeholder)
        if (etat) {
          await handleOrderStatus(customerId, etat);
        }

        rows.push({
          index: index + 1,
          data: row,
          success: true,
          warnings: warnings.length > 0 ? warnings : undefined,
        });
      } catch (error) {
        console.error(`Error importing customer at row ${index + 1}:`, error);
        rows.push({
          index: index + 1,
          data: row,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create/update customer",
        });
      }
    }

    return {
      summary: buildImportSummary("Customers", file.name, rows),
      rows,
    };
  } catch (error) {
    console.error("Error in customer import:", error);
    return {
      summary: {
        step: "Customers",
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
          "Failed to process customers: " +
          (error instanceof Error ? error.message : String(error)),
      })),
    };
  }
}
