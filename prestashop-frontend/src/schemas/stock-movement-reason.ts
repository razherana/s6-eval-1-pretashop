// src/schemas/stock-movement-reason.ts
import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const dataSchema: DataXmlApiSchema = {
  rootTag: "stock_movement_reason",
  fields: {
    id: {
      xmlTag: "id",
      type: "simple",
    },
    sign: {
      xmlTag: "sign",
      type: "simple",
    },
    deleted: {
      xmlTag: "deleted",
      type: "simple",
    },
    date_add: {
      xmlTag: "date_add",
      type: "simple",
    },
    date_upd: {
      xmlTag: "date_upd",
      type: "simple",
    },
  },
  multiLangFields: {
    name: {
      type: "multiLang",
      xmlTag: "name",
      attributes: { required: "true", maxSize: "255" },
      languages: [1, 2, 3],
    },
  },
  associations: {},
};

export const stockMovementReasonSchema: XmlApiSchema = {
  data: dataSchema,
  transforms: {},
};