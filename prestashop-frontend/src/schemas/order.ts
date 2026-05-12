import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const dataSchema: DataXmlApiSchema = {
  rootTag: "order",
  fields: {
    id_address_delivery: {
      xmlTag: "id_address_delivery",
      type: "simple",
      attributes: { required: "true" },
    },
    id_address_invoice: {
      xmlTag: "id_address_invoice",
      type: "simple",
      attributes: { required: "true" },
    },
    id_cart: {
      xmlTag: "id_cart",
      type: "simple",
      attributes: { required: "true" },
    },
    id_currency: {
      xmlTag: "id_currency",
      type: "simple",
      attributes: { required: "true" },
    },
    id_lang: {
      xmlTag: "id_lang",
      type: "simple",
      attributes: { required: "true" },
    },
    id_customer: {
      xmlTag: "id_customer",
      type: "simple",
      attributes: { required: "true" },
    },
    id_carrier: {
      xmlTag: "id_carrier",
      type: "simple",
      attributes: { required: "true" },
    },
    current_state: {
      xmlTag: "current_state",
      type: "simple",
      attributes: {},
    },
    module: {
      xmlTag: "module",
      type: "simple",
      attributes: { required: "true" },
    },
    payment: {
      xmlTag: "payment",
      type: "simple",
      attributes: { required: "true" },
    },
    total_paid: {
      xmlTag: "total_paid",
      type: "simple",
      attributes: {},
    },
    total_paid_tax_incl: {
      xmlTag: "total_paid_tax_incl",
      type: "simple",
      attributes: {},
    },
    total_paid_tax_excl: {
      xmlTag: "total_paid_tax_excl",
      type: "simple",
      attributes: {},
    },
    total_paid_real: {
      xmlTag: "total_paid_real",
      type: "simple",
      attributes: {},
    },
    total_products: {
      xmlTag: "total_products",
      type: "simple",
      attributes: {},
    },
    total_products_wt: {
      xmlTag: "total_products_wt",
      type: "simple",
      attributes: {},
    },
    total_shipping: {
      xmlTag: "total_shipping",
      type: "simple",
      attributes: {},
    },
    total_shipping_tax_incl: {
      xmlTag: "total_shipping_tax_incl",
      type: "simple",
      attributes: {},
    },
    total_shipping_tax_excl: {
      xmlTag: "total_shipping_tax_excl",
      type: "simple",
      attributes: {},
    },
    conversion_rate: {
      xmlTag: "conversion_rate",
      type: "simple",
      attributes: {},
    },
    id_shop: {
      xmlTag: "id_shop",
      type: "simple",
      attributes: {},
    },
    id_shop_group: {
      xmlTag: "id_shop_group",
      type: "simple",
      attributes: {},
    },
    secure_key: {
      xmlTag: "secure_key",
      type: "simple",
      attributes: {},
    },
    valid: {
      xmlTag: "valid",
      type: "simple",
      attributes: {},
    },
  },
  multiLangFields: {},
  associations: {},
};

export const orderSchema: XmlApiSchema = {
  data: dataSchema,
  transforms: {},
};