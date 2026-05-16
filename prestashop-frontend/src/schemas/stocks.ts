import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const dataSchema: DataXmlApiSchema = {
  rootTag: "stock",
  fields: {
    id_warehouse: {
      xmlTag: "id_warehouse",
      type: "simple",
      attributes: { required: "true", format: "isUnsignedId" },
    },
    id_product: {
      xmlTag: "id_product",
      type: "simple",
      attributes: { required: "true", format: "isUnsignedId" },
    },
    id_product_attribute: {
      xmlTag: "id_product_attribute",
      type: "simple",
      attributes: { required: "true", format: "isUnsignedId" },
    },
    real_quantity: {
      xmlTag: "real_quantity",
      type: "simple",
      attributes: {
        notFilterable: "true",
        read_only: "true",
        readOnly: "true",
      },
    },
    reference: {
      xmlTag: "reference",
      type: "simple",
      attributes: { format: "isReference" },
    },
    ean13: {
      xmlTag: "ean13",
      type: "simple",
      attributes: { format: "isEan13" },
    },
    isbn: {
      xmlTag: "isbn",
      type: "simple",
      attributes: { format: "isIsbn" },
    },
    upc: {
      xmlTag: "upc",
      type: "simple",
      attributes: { format: "isUpc" },
    },
    mpn: {
      xmlTag: "mpn",
      type: "simple",
      attributes: { format: "isMpn" },
    },
    physical_quantity: {
      xmlTag: "physical_quantity",
      type: "simple",
      attributes: { required: "true", format: "isUnsignedInt" },
    },
    usable_quantity: {
      xmlTag: "usable_quantity",
      type: "simple",
      attributes: { required: "true", format: "isInt" },
    },
    price_te: {
      xmlTag: "price_te",
      type: "simple",
      attributes: { required: "true", format: "isPrice" },
    },
  },
  multiLangFields: {},
  associations: {},
};

const stockSchema: XmlApiSchema = {
  data: dataSchema,
  transforms: {},
};

export default stockSchema;