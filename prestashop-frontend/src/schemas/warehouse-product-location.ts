import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const warehouseProductLocationSchema: XmlApiSchema = {
  data: {
    rootTag: "warehouse_product_location",
    fields: {
      id_product: {
        xmlTag: "id_product",
        type: "simple",
        attributes: { required: "true" },
      },
      id_product_attribute: {
        xmlTag: "id_product_attribute",
        type: "simple",
        attributes: { required: "true" },
      },
      id_warehouse: {
        xmlTag: "id_warehouse",
        type: "simple",
        attributes: { required: "true" },
      },
      location: {
        xmlTag: "location",
        type: "simple",
        attributes: { maxSize: "64" },
      },
    } as DataXmlApiSchema["fields"],
    multiLangFields: {} as DataXmlApiSchema["multiLangFields"],
    associations: {},
  },
  transforms: {},
};

export default warehouseProductLocationSchema;
