// src/schemas/orderInvoice.ts
import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const dataSchema: DataXmlApiSchema = {
  rootTag: "order_invoice",
  fields: {
    id: {
      xmlTag: "id",
      type: "simple",
    },
    id_order: {
      xmlTag: "id_order",
      type: "simple",
    },
    number: {
      xmlTag: "number",
      type: "simple",
    },
    delivery_number: {
      xmlTag: "delivery_number",
      type: "simple",
    },
    delivery_date: {
      xmlTag: "delivery_date",
      type: "simple",
    },
    total_discount_tax_excl: {
      xmlTag: "total_discount_tax_excl",
      type: "simple",
    },
    total_discount_tax_incl: {
      xmlTag: "total_discount_tax_incl",
      type: "simple",
    },
    total_paid_tax_excl: {
      xmlTag: "total_paid_tax_excl",
      type: "simple",
    },
    total_paid_tax_incl: {
      xmlTag: "total_paid_tax_incl",
      type: "simple",
    },
    total_products: {
      xmlTag: "total_products",
      type: "simple",
    },
    total_products_wt: {
      xmlTag: "total_products_wt",
      type: "simple",
    },
    total_shipping_tax_excl: {
      xmlTag: "total_shipping_tax_excl",
      type: "simple",
    },
    total_shipping_tax_incl: {
      xmlTag: "total_shipping_tax_incl",
      type: "simple",
    },
    shipping_tax_computation_method: {
      xmlTag: "shipping_tax_computation_method",
      type: "simple",
    },
    total_wrapping_tax_excl: {
      xmlTag: "total_wrapping_tax_excl",
      type: "simple",
    },
    total_wrapping_tax_incl: {
      xmlTag: "total_wrapping_tax_incl",
      type: "simple",
    },
    shop_address: {
      xmlTag: "shop_address",
      type: "simple",
    },
    note: {
      xmlTag: "note",
      type: "simple",
    },
    date_add: {
      xmlTag: "date_add",
      type: "simple",
    },
  },
  multiLangFields: {},
  associations: {},
};

export const orderInvoiceSchema: XmlApiSchema = {
  data: dataSchema,
  transforms: {},
};
