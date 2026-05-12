import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const dataSchema: DataXmlApiSchema = {
  rootTag: "address",
  fields: {
    id_customer: {
      xmlTag: "id_customer",
      type: "simple",
      attributes: { required: "true" },
    },
    id_country: {
      xmlTag: "id_country",
      type: "simple",
      attributes: { required: "true" },
    },
    alias: {
      xmlTag: "alias",
      type: "simple",
      attributes: { required: "true", maxSize: "32" },
    },
    lastname: {
      xmlTag: "lastname",
      type: "simple",
      attributes: { required: "true", maxSize: "32" },
    },
    firstname: {
      xmlTag: "firstname",
      type: "simple",
      attributes: { required: "true", maxSize: "32" },
    },
    address1: {
      xmlTag: "address1",
      type: "simple",
      attributes: { required: "true", maxSize: "128" },
    },
    postcode: {
      xmlTag: "postcode",
      type: "simple",
      attributes: {},
    },
    city: {
      xmlTag: "city",
      type: "simple",
      attributes: { required: "true", maxSize: "64" },
    },
    phone: {
      xmlTag: "phone",
      type: "simple",
      attributes: {},
    },
    phone_mobile: {
      xmlTag: "phone_mobile",
      type: "simple",
      attributes: {},
    },
  },
  multiLangFields: {},
  associations: {},
};

export const addressSchema: XmlApiSchema = {
  data: dataSchema,
  transforms: {},
};