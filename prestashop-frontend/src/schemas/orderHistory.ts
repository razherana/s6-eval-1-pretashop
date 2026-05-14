// src/schemas/orderHistory.ts
import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const dataSchema: DataXmlApiSchema = {
  rootTag: "order_history",
  fields: {
    id: {
      xmlTag: "id",
      type: "simple",
    },
    date_add: {
      xmlTag: "date_add",
      type: "simple",
      attributes: { required: "true" },
    },
    id_order_state: {
      xmlTag: "id_order_state",
      type: "simple",
      attributes: { required: "true" },
    },
    id_order: {
      xmlTag: "id_order",
      type: "simple",
      attributes: { required: "true" },
    },
  },
  multiLangFields: {},
  associations: {},
};

export const orderHistorySchema: XmlApiSchema = {
  data: dataSchema,
  transforms: {},
};