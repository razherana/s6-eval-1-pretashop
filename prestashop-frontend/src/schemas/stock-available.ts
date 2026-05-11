import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

export const stockAvailableSchema: XmlApiSchema = {
  data: {
    rootTag: "stock_available",
    fields: {
      id : {
        xmlTag: "id",
        type: "simple",
        attributes: { required: "true" },
      },
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
      id_shop: {
        xmlTag: "id_shop",
        type: "simple",
        attributes: {},
      },
      quantity: {
        xmlTag: "quantity",
        type: "simple",
        attributes: {},
      },
      depends_on_stock: {
        xmlTag: "depends_on_stock",
        type: "simple",
        attributes: {},
      },
      out_of_stock: {
        xmlTag: "out_of_stock",
        type: "simple",
        attributes: {},
      },
    } as DataXmlApiSchema["fields"],
    multiLangFields: {},
    associations: {},
  },
  transforms: {},
};