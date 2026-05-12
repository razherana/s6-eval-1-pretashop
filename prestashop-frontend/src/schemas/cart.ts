// src/schemas/cart.ts
import type { DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const dataSchema: DataXmlApiSchema = {
  rootTag: "cart",
  fields: {
    id_cart: {
      xmlTag: "id",
      type: "simple",
      attributes: {},
    },
    id_address_delivery: {
      xmlTag: "id_address_delivery",
      type: "simple",
      attributes: {},
    },
    id_address_invoice: {
      xmlTag: "id_address_invoice",
      type: "simple",
      attributes: {},
    },
    id_currency: {
      xmlTag: "id_currency",
      type: "simple",
      attributes: { required: "true" },
    },
    id_customer: {
      xmlTag: "id_customer",
      type: "simple",
      attributes: {},
    },
    id_guest: {
      xmlTag: "id_guest",
      type: "simple",
      attributes: {},
    },
    id_lang: {
      xmlTag: "id_lang",
      type: "simple",
      attributes: { required: "true" },
    },
    id_shop_group: {
      xmlTag: "id_shop_group",
      type: "simple",
      attributes: {},
    },
    id_shop: {
      xmlTag: "id_shop",
      type: "simple",
      attributes: {},
    },
    id_carrier: {
      xmlTag: "id_carrier",
      type: "simple",
      attributes: {},
    },
    recyclable: {
      xmlTag: "recyclable",
      type: "simple",
      attributes: {},
    },
    gift: {
      xmlTag: "gift",
      type: "simple",
      attributes: {},
    },
    gift_message: {
      xmlTag: "gift_message",
      type: "simple",
      attributes: {},
    },
    mobile_theme: {
      xmlTag: "mobile_theme",
      type: "simple",
      attributes: {},
    },
    delivery_option: {
      xmlTag: "delivery_option",
      type: "simple",
      attributes: {},
    },
    secure_key: {
      xmlTag: "secure_key",
      type: "simple",
      attributes: {},
    },
    allow_seperated_package: {
      xmlTag: "allow_seperated_package",
      type: "simple",
      attributes: {},
    },
    date_add: {
      xmlTag: "date_add",
      type: "simple",
      attributes: {},
    },
    date_upd: {
      xmlTag: "date_upd",
      type: "simple",
      attributes: {},
    },
  },
  multiLangFields: {},
  associations: {
    cart_rows: {
      nodeType: "cart_row",
      api: "cart_rows",
      fields: {},
      csvMapping: {
        cart_rows: {
          transform: "toCartRows",
        },
      },
    },
  },
};

export const cartSchema: XmlApiSchema = {
  data: dataSchema,
  transforms: {
    toCartRows: (container, csvValue, _rowData) => {
      console.log("Transforming cart_rows CSV:", csvValue);
      const rows = csvValue.split(";").filter((row) => row.trim());
      for (const row of rows) {
        const [id_product, id_product_attribute, quantity] = row
          .split(",")
          .map((part) => part.trim());
        const cartRowElement = container.ele("cart_row");
        cartRowElement.ele("id_product").dat(id_product);

        if (id_product_attribute)
          cartRowElement.ele("id_product_attribute").dat(id_product_attribute);
        else cartRowElement.ele("id_product_attribute").dat("0");

        cartRowElement.ele("quantity").dat(quantity);
      }
    },
  },
};
