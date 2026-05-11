import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

export const productOptionSchema: XmlApiSchema = {
  data: {
    rootTag: "product_option",
    fields: {
      is_color_group: {
        xmlTag: "is_color_group",
        type: "simple",
        attributes: {},
      },
      group_type: {
        xmlTag: "group_type",
        type: "simple",
        attributes: { required: "true" },
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
      public_name: {
        type: "multiLang",
        xmlTag: "public_name",
        attributes: { required: "true", maxSize: "64" },
        languages: [1, 2, 3],
      },
    } as DataXmlApiSchema["multiLangFields"],
    associations: {},
  },
  transforms: {},
};