// src/schemas/orderSlip.ts
import type {
  AssociationTransformFunction,
  DataXmlApiSchema,
  XmlApiSchema,
} from "@/utils/xml";

const dataSchema: DataXmlApiSchema = {
  rootTag: "order_slip",
  fields: {
    id: {
      xmlTag: "id",
      type: "simple",
    },
    id_customer: {
      xmlTag: "id_customer",
      type: "simple",
      attributes: { required: "true", format: "isUnsignedId" },
    },
    id_order: {
      xmlTag: "id_order",
      type: "simple",
      attributes: { required: "true", format: "isUnsignedId" },
    },
    conversion_rate: {
      xmlTag: "conversion_rate",
      type: "simple",
      attributes: { required: "true", format: "isFloat" },
    },
    total_products_tax_excl: {
      xmlTag: "total_products_tax_excl",
      type: "simple",
      attributes: { required: "true", format: "isFloat" },
    },
    total_products_tax_incl: {
      xmlTag: "total_products_tax_incl",
      type: "simple",
      attributes: { required: "true", format: "isFloat" },
    },
    total_shipping_tax_excl: {
      xmlTag: "total_shipping_tax_excl",
      type: "simple",
      attributes: { required: "true", format: "isFloat" },
    },
    total_shipping_tax_incl: {
      xmlTag: "total_shipping_tax_incl",
      type: "simple",
      attributes: { required: "true", format: "isFloat" },
    },
    amount: {
      xmlTag: "amount",
      type: "simple",
      attributes: { format: "isFloat" },
    },
    shipping_cost: {
      xmlTag: "shipping_cost",
      type: "simple",
    },
    shipping_cost_amount: {
      xmlTag: "shipping_cost_amount",
      type: "simple",
      attributes: { format: "isFloat" },
    },
    partial: {
      xmlTag: "partial",
      type: "simple",
    },
    date_add: {
      xmlTag: "date_add",
      type: "simple",
      attributes: { format: "isDate" },
    },
    date_upd: {
      xmlTag: "date_upd",
      type: "simple",
      attributes: { format: "isDate" },
    },
    order_slip_type: {
      xmlTag: "order_slip_type",
      type: "simple",
      attributes: { format: "isInt" },
    },
  },
  multiLangFields: {},
  associations: {
    order_slip_details: {
      nodeType: "order_slip_detail",
      api: "",
      fields: {},
      csvMapping: {
        order_rows_json: { transform: "toOrderSlipDetails" },
      },
    },
  },
};

const transforms: Record<string, AssociationTransformFunction> = {
  toOrderSlipDetails: (container, csvValue, _rowData, schema) => {
    const rows = JSON.parse(csvValue);
    for (const row of rows) {
      const slipDetail = container.ele(schema.nodeType);
      slipDetail.ele("id").dat("");
      slipDetail
        .ele("id_order_detail", { required: "true" })
        .dat(row.id.toString());
      slipDetail
        .ele("product_quantity", { required: "true" })
        .dat(row.product_quantity.toString());
      const amountTaxIncl = (
        row.unit_price_tax_incl * row.product_quantity
      ).toFixed(6);
      slipDetail
        .ele("amount_tax_excl", { required: "true" })
        .dat(amountTaxIncl);
      slipDetail
        .ele("amount_tax_incl", { required: "true" })
        .dat(amountTaxIncl);
    }
  },
};

export const orderSlipSchema: XmlApiSchema = {
  data: dataSchema,
  transforms,
};
