import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

export const customerSchema: XmlApiSchema = {
  data: {
    rootTag: "customer",
    fields: {
      id: {
        xmlTag: "id",
        type: "simple",
        attributes: {},
      },
      firstname: {
        xmlTag: "firstname",
        type: "simple",
        attributes: { required: "true", maxSize: "32" },
      },
      lastname: {
        xmlTag: "lastname",
        type: "simple",
        attributes: { required: "true", maxSize: "32" },
      },
      email: {
        xmlTag: "email",
        type: "simple",
        attributes: { required: "true", maxSize: "128" },
      },
      passwd: {
        xmlTag: "passwd",
        type: "simple",
        attributes: { required: "true", maxSize: "60" },
      },
      active: {
        xmlTag: "active",
        type: "simple",
        attributes: {},
      },
      newsletter: {
        xmlTag: "newsletter",
        type: "simple",
        attributes: {},
      },
      optin: {
        xmlTag: "optin",
        type: "simple",
        attributes: {},
      },
    } as DataXmlApiSchema["fields"],
    multiLangFields: {},
    associations: {},
  },
  transforms: {},
};

export default customerSchema;