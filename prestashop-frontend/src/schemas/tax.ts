import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const taxSchema: XmlApiSchema = {
  data: {
    rootTag: "tax",
    fields: {
      rate: {
        xmlTag: "rate",
        type: "simple",
        attributes: {},
      },
      active: {
        xmlTag: "active",
        type: "simple",
        attributes: {},
      },
      deleted: {
        xmlTag: "deleted",
        type: "simple",
        attributes: {},
      },
    } as DataXmlApiSchema["fields"],
    multiLangFields: {
      name: {
        type: "multiLang",
        xmlTag: "name",
        attributes: { maxSize: "64" },
        languages: [1, 2, 3],
      },
    } as DataXmlApiSchema["multiLangFields"],
    associations: {},
  },
  transforms: {},
};

const taxRuleGroupSchema: XmlApiSchema = {
  data: {
    rootTag: "tax_rule_group",
    fields: {
      name: {
        xmlTag: "name",
        type: "simple",
        attributes: {},
      },
      active: {
        xmlTag: "active",
        type: "simple",
        attributes: {},
      },
    } as DataXmlApiSchema["fields"],
    multiLangFields: {},
    associations: {},
  },
  transforms: {},
};

const taxRuleSchema: XmlApiSchema = {
  data: {
    rootTag: "tax_rule",
    fields: {
      id_tax_rules_group: {
        xmlTag: "id_tax_rules_group",
        type: "simple",
        attributes: {},
      },
      id_country: {
        xmlTag: "id_country",
        type: "simple",
        attributes: {},
      },
      id_tax: {
        xmlTag: "id_tax",
        type: "simple",
        attributes: {},
      },
      behavior: {
        xmlTag: "behavior",
        type: "simple",
        attributes: {},
      },
    } as DataXmlApiSchema["fields"],
    multiLangFields: {},
    associations: {},
  },
  transforms: {},
};

export { taxSchema, taxRuleGroupSchema, taxRuleSchema };