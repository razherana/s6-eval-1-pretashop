// src/schemas/stock-movement.ts
import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const dataSchema: DataXmlApiSchema = {
  rootTag: "stock_mvt",
  fields: {
    id: {
      xmlTag: "id",
      type: "simple",
    },
    id_product: {
      xmlTag: "id_product",
      type: "simple",
    },
    id_product_attribute: {
      xmlTag: "id_product_attribute",
      type: "simple",
    },
    id_warehouse: {
      xmlTag: "id_warehouse",
      type: "simple",
    },
    id_currency: {
      xmlTag: "id_currency",
      type: "simple",
    },
    management_type: {
      xmlTag: "management_type",
      type: "simple",
    },
    id_employee: {
      xmlTag: "id_employee",
      type: "simple",
    },
    id_stock: {
      xmlTag: "id_stock",
      type: "simple",
    },
    id_stock_mvt_reason: {
      xmlTag: "id_stock_mvt_reason",
      type: "simple",
    },
    id_order: {
      xmlTag: "id_order",
      type: "simple",
    },
    id_supply_order: {
      xmlTag: "id_supply_order",
      type: "simple",
    },
    ean13: {
      xmlTag: "ean13",
      type: "simple",
    },
    upc: {
      xmlTag: "upc",
      type: "simple",
    },
    reference: {
      xmlTag: "reference",
      type: "simple",
    },
    mpn: {
      xmlTag: "mpn",
      type: "simple",
    },
    physical_quantity: {
      xmlTag: "physical_quantity",
      type: "simple",
    },
    sign: {
      xmlTag: "sign",
      type: "simple",
    },
    last_wa: {
      xmlTag: "last_wa",
      type: "simple",
    },
    current_wa: {
      xmlTag: "current_wa",
      type: "simple",
    },
    price_te: {
      xmlTag: "price_te",
      type: "simple",
    },
    date_add: {
      xmlTag: "date_add",
      type: "simple",
    },
  },
  multiLangFields: {
    product_name: {
      type: "multiLang",
      xmlTag: "product_name",
      attributes: {},
      languages: [1, 2, 3],
    },
  },
  associations: {},
};

export const stockMovementSchema: XmlApiSchema = {
  data: dataSchema,
  transforms: {},
};