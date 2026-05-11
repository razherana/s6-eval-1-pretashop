import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const categorySchema: XmlApiSchema = {
  data: {
    rootTag: "category",
    fields: {
      active: {
        xmlTag: "active",
        type: "simple",
        attributes: {},
      },
      id_parent: {
        xmlTag: "id_parent",
        type: "simple",
        attributes: {},
      },
    } as DataXmlApiSchema["fields"],
    multiLangFields: {
      name: {
        type: "multiLang",
        xmlTag: "name",
        attributes: { maxSize: "128" },
        languages: [1, 2, 3],
      },
      link_rewrite: {
        type: "multiLang",
        xmlTag: "link_rewrite",
        attributes: { maxSize: "128" },
        languages: [1, 2, 3],
      },
    } as DataXmlApiSchema["multiLangFields"],
    associations: {},
  },
  transforms: {},
};

export default categorySchema;