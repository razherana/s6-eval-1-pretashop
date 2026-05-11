import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

export const productOptionValueSchema: XmlApiSchema = {
  data: {
    rootTag: "product_option_value",
    fields: {
      id_attribute_group: {
        xmlTag: "id_attribute_group",
        type: "simple",
        attributes: { required: "true" },
      },
      color: {
        xmlTag: "color",
        type: "simple",
        attributes: {},
      },
      position: {
        xmlTag: "position",
        type: "simple",
        attributes: {},
      },
    } as DataXmlApiSchema["fields"],
    multiLangFields: {
      name: {
        type: "multiLang",
        xmlTag: "name",
        attributes: { required: "true", maxSize: "128" },
        languages: [1, 2, 3],
      },
    } as DataXmlApiSchema["multiLangFields"],
    associations: {},
  },
  transforms: {},
};