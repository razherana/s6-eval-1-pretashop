import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const warehouseSchema: XmlApiSchema = {
  data: {
    rootTag: "warehouse",
    fields: {
      id_address: {
        xmlTag: "id_address",
        type: "simple",
        attributes: { required: "true" },
      },
      id_employee: {
        xmlTag: "id_employee",
        type: "simple",
        attributes: { required: "true" },
      },
      id_currency: {
        xmlTag: "id_currency",
        type: "simple",
        attributes: { required: "true" },
      },
      valuation: {
        xmlTag: "valuation",
        type: "simple",
        attributes: { notFilterable: "true", read_only: "true" },
      },
      deleted: {
        xmlTag: "deleted",
        type: "simple",
        attributes: {},
      },
      reference: {
        xmlTag: "reference",
        type: "simple",
        attributes: { required: "true", maxSize: "64" },
      },
      name: {
        xmlTag: "name",
        type: "simple",
        attributes: { required: "true", maxSize: "45" },
      },
      management_type: {
        xmlTag: "management_type",
        type: "simple",
        attributes: { required: "true" },
      },
    } as DataXmlApiSchema["fields"],
    multiLangFields: {} as DataXmlApiSchema["multiLangFields"],
    associations: {},
  },
  transforms: {},
};

export default warehouseSchema;
