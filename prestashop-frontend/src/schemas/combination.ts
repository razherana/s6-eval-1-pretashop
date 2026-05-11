import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

export const combinationSchema: XmlApiSchema = {
  data: {
    rootTag: "combination",
    fields: {
      id_product: {
        xmlTag: "id_product",
        type: "simple",
        attributes: { required: "true" },
      },
      reference: {
        xmlTag: "reference",
        type: "simple",
        attributes: { maxSize: "64" },
      },
      ean13: {
        xmlTag: "ean13",
        type: "simple",
        attributes: { maxSize: "13" },
      },
      price: {
        xmlTag: "price",
        type: "simple",
        attributes: {},
      },
      quantity: {
        xmlTag: "quantity",
        type: "simple",
        attributes: {},
      },
      minimal_quantity: {
        xmlTag: "minimal_quantity",
        type: "simple",
        attributes: {},
      },
      default_on: {
        xmlTag: "default_on",
        type: "simple",
        attributes: {},
      },
    } as DataXmlApiSchema["fields"],
    multiLangFields: {},
    associations: {
      product_option_values: {
        nodeType: "product_option_value",
        api: "product_option_values",
        fields: {
          id: { xmlTag: "id", type: "simple" },
        },
        csvMapping: {
          product_option_value_ids: { transform: "toProductOptionValues" },
        },
      },
    },
  },
  transforms: {
    toProductOptionValues: (container, csvValue, _rowData, schema) => {
      const ids = csvValue.split(",").filter((id) => id.trim());
      for (const id of ids) {
        const element = container.ele(schema.nodeType);
        element.ele("id").dat(id.trim());
      }
    },
  },
};