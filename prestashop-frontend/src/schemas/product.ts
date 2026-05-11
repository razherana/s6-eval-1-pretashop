import type {
  AssociationTransformFunction,
  DataXmlApiSchema,
  XmlApiSchema,
} from "@/utils/xml";

const dataSchema: DataXmlApiSchema = {
  rootTag: "product",
  fields: {
    id_product: {
      xmlTag: "id",
      type: "simple",
      attributes: {},
    },
    price: {
      xmlTag: "price",
      type: "simple",
      attributes: { required: "true" },
    },
    wholesale_price: {
      xmlTag: "wholesale_price",
      type: "simple",
      attributes: {},
    },
    active: {
      xmlTag: "active",
      type: "simple",
      attributes: {},
    },
    available_for_order: {
      xmlTag: "available_for_order",
      type: "simple",
      attributes: {},
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
    quantity: {
      xmlTag: "quantity",
      type: "simple",
      attributes: { notFilterable: "true", read_only: "true" },
    },
    minimal_quantity: {
      xmlTag: "minimal_quantity",
      type: "simple",
      attributes: {},
    },
    on_sale: {
      xmlTag: "on_sale",
      type: "simple",
      attributes: {},
    },
    visibility: {
      xmlTag: "visibility",
      type: "simple",
      attributes: {},
    },
    condition: {
      xmlTag: "condition",
      type: "simple",
      attributes: {},
    },
    width: {
      xmlTag: "width",
      type: "simple",
      attributes: {},
    },
    height: {
      xmlTag: "height",
      type: "simple",
      attributes: {},
    },
    depth: {
      xmlTag: "depth",
      type: "simple",
      attributes: {},
    },
    weight: {
      xmlTag: "weight",
      type: "simple",
      attributes: {},
    },
    ecotax: {
      xmlTag: "ecotax",
      type: "simple",
      attributes: {},
    },
    unity: {
      xmlTag: "unity",
      type: "simple",
      attributes: {},
    },
    unit_price: {
      xmlTag: "unit_price",
      type: "simple",
      attributes: {},
    },
    id_category_default: {
      xmlTag: "id_category_default",
      type: "simple",
      attributes: {},
    },
    id_tax_rules_group: {
      xmlTag: "id_tax_rules_group",
      type: "simple",
      attributes: {},
    },
    state: {
      xmlTag: "state",
      type: "simple",
      attributes: {},
    },
    customizable: {
      xmlTag: "customizable",
      type: "simple",
      attributes: {},
    },
    text_fields: {
      xmlTag: "text_fields",
      type: "simple",
      attributes: {},
    },
    uploadable_files: {
      xmlTag: "uploadable_files",
      type: "simple",
      attributes: {},
    },
    redirect_type: {
      xmlTag: "redirect_type",
      type: "simple",
      attributes: {},
    },
    id_type_redirected: {
      xmlTag: "id_type_redirected",
      type: "simple",
      attributes: {},
    },
    available_date: {
      xmlTag: "available_date",
      type: "simple",
      attributes: {},
    },
    show_condition: {
      xmlTag: "show_condition",
      type: "simple",
      attributes: {},
    },
    pack_stock_type: {
      xmlTag: "pack_stock_type",
      type: "simple",
      attributes: {},
    },
    low_stock_threshold: {
      xmlTag: "low_stock_threshold",
      type: "simple",
      attributes: {},
    },
    low_stock_alert: {
      xmlTag: "low_stock_alert",
      type: "simple",
      attributes: {},
    },
    advanced_stock_management: {
      xmlTag: "advanced_stock_management",
      type: "simple",
      attributes: {},
    },
    online_only: {
      xmlTag: "online_only",
      type: "simple",
      attributes: {},
    },
    show_price: {
      xmlTag: "show_price",
      type: "simple",
      attributes: {},
    },
  },
  multiLangFields: {
    name: {
      type: "multiLang",
      xmlTag: "name",
      attributes: { maxSize: "128" },
      languages: [1, 2, 3],
    },
    description: {
      type: "multiLang",
      xmlTag: "description",
      attributes: { maxSize: "4194303" },
      languages: [1, 2, 3],
    },
    description_short: {
      type: "multiLang",
      xmlTag: "description_short",
      attributes: { maxSize: "4194303" },
      languages: [1, 2, 3],
    },
    link_rewrite: {
      type: "multiLang",
      xmlTag: "link_rewrite",
      attributes: { maxSize: "128" },
      languages: [1, 2, 3],
    },
    meta_title: {
      type: "multiLang",
      xmlTag: "meta_title",
      attributes: { maxSize: "255" },
      languages: [1, 2, 3],
    },
    meta_description: {
      type: "multiLang",
      xmlTag: "meta_description",
      attributes: { maxSize: "512" },
      languages: [1, 2, 3],
    },
    meta_keywords: {
      type: "multiLang",
      xmlTag: "meta_keywords",
      attributes: { maxSize: "255" },
      languages: [1, 2, 3],
    },
    available_now: {
      type: "multiLang",
      xmlTag: "available_now",
      attributes: { maxSize: "255" },
      languages: [1, 2, 3],
    },
    available_later: {
      type: "multiLang",
      xmlTag: "available_later",
      attributes: { maxSize: "255" },
      languages: [1, 2, 3],
    },
  },
  associations: {
    categories: {
      nodeType: "category",
      api: "categories",
      fields: {
        id: { xmlTag: "id", type: "simple" },
      },
      csvMapping: {
        categorie: { transform: "toCategoryById" },
        id_category_default: { transform: "toCategoryById" },
      },
    },
    stock_availables: {
      nodeType: "stock_available",
      api: "stock_availables",
      fields: {
        id: { xmlTag: "id", type: "simple" },
        id_product_attribute: {
          xmlTag: "id_product_attribute",
          type: "simple",
        },
      },
      csvMapping: {
        quantity: {
          transform: "toStockAvailable",
          targetField: "quantity",
        },
      },
    },
    images: {
      nodeType: "image",
      api: "images",
      fields: {
        id: { xmlTag: "id", type: "simple" },
      },
      csvMapping: {
        image_urls: { transform: "toImages" },
      },
    },
  },
};

const transforms: Record<string, AssociationTransformFunction> = {
  toCategoryById: (container, csvValue, _rowData, schema) => {
    // This will be handled externally since we need category IDs
    // The categories will be resolved before conversion
    const categoryIds = csvValue.split(",").filter((id) => id.trim());
    for (const categoryId of categoryIds) {
      const categoryElement = container.ele(schema.nodeType);
      categoryElement.ele("id").dat(categoryId.trim());
    }
  },
};

const productSchema: XmlApiSchema = {
  data: dataSchema,
  transforms,
};

export default productSchema;