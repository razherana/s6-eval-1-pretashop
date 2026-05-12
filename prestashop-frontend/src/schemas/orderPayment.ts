// src/schemas/orderPayment.ts
import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const dataSchema: DataXmlApiSchema = {
  rootTag: "order_payment",
  fields: {
    order_reference: {
      xmlTag: "order_reference",
      type: "simple",
      attributes: {},
    },
    id_currency: {
      xmlTag: "id_currency",
      type: "simple",
      attributes: { required: "true" },
    },
    amount: {
      xmlTag: "amount",
      type: "simple",
      attributes: { required: "true" },
    },
    payment_method: {
      xmlTag: "payment_method",
      type: "simple",
      attributes: {},
    },
    conversion_rate: {
      xmlTag: "conversion_rate",
      type: "simple",
      attributes: {},
    },
    transaction_id: {
      xmlTag: "transaction_id",
      type: "simple",
      attributes: {},
    },
    date_add: {
      xmlTag: "date_add",
      type: "simple",
      attributes: {},
    },
  },
  multiLangFields: {},
  associations: {},
};

export const orderPaymentSchema: XmlApiSchema = {
  data: dataSchema,
  transforms: {},
};