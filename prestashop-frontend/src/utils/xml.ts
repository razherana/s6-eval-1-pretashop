import { XMLParser } from "fast-xml-parser";
import { create } from "xmlbuilder2";
import type { XMLBuilder } from "xmlbuilder2/lib/interfaces";

const parser = new XMLParser({
  ignoreAttributes: false,
});

export function readXml<T = unknown>(xmlString: string): T {
  const jsonObj = parser.parse(xmlString).prestashop;

  return jsonObj as T;
}

export interface FieldSchema {
  xmlTag: string;
  type: "simple" | "multiLang";
  attributes?: Record<string, string>;
}

export interface MultiLangFieldSchema extends FieldSchema {
  languages: number[];
}

export interface AssociationSchema {
  nodeType: string;
  api: string;
  fields: Record<string, FieldSchema>;
  csvMapping: Record<string, { transform: string; targetField?: string }>;
}

export type AssociationTransformFunction = (
  container: XMLBuilder,
  csvValue: string,
  rowData: Record<string, string>,
  schema: AssociationSchema,
) => void;

export interface XmlApiSchema {
  data: DataXmlApiSchema;
  transforms: Record<string, AssociationTransformFunction>;
}

export interface DataXmlApiSchema {
  rootTag: string;
  fields: Record<string, FieldSchema>;
  multiLangFields: Record<string, MultiLangFieldSchema>;
  associations: Record<string, AssociationSchema>;
}

export class PrestaShopXMLConverter {
  private schema: DataXmlApiSchema;
  private apiUrl: string;
  private transformRegistry: Record<string, AssociationTransformFunction>;

  constructor(schema: XmlApiSchema, apiUrl: string) {
    this.schema = schema.data;
    this.apiUrl = apiUrl;

    // Register all transform functions
    this.transformRegistry = {
      toStockAvailable: this.transformToStockAvailable.bind(this),
      toImages: this.transformToImages.bind(this),
      toCategory: this.transformToCategory.bind(this),
      toCombinations: this.transformToCombinations.bind(this),
      toProductFeatures: this.transformToProductFeatures.bind(this),
      toTags: this.transformToTags.bind(this),
      toAttachments: this.transformToAttachments.bind(this),
      toAccessories: this.transformToAccessories.bind(this),
      toProductBundle: this.transformToProductBundle.bind(this),
    };

    if (schema.transforms)
      Object.entries(schema.transforms).forEach(([name, fn]) => {
        this.transformRegistry[name] = fn.bind(this);
      });
  }

  private buildAttributes(fieldSchema: FieldSchema): Record<string, string> {
    const attrs: Record<string, string> = {};

    if (fieldSchema.attributes) {
      Object.assign(attrs, fieldSchema.attributes);
    }

    return attrs;
  }

  private addSimpleField(
    parent: XMLBuilder,
    tagName: string,
    value: string,
    fieldSchema: FieldSchema,
  ) {
    if (value === "" || value === undefined || value === null) return;

    if (fieldSchema.attributes && fieldSchema.attributes.read_only === "true") {
      console.warn(
        `Skipping read-only field "${tagName}" with value "${value}"`,
      );
      return;
    }

    const attrs = this.buildAttributes(fieldSchema);
    parent.ele(tagName, attrs).dat(value);
  }

  private addMultiLangField(
    parent: XMLBuilder,
    tagName: string,
    values: Record<string, string>,
    fieldSchema: MultiLangFieldSchema,
  ) {
    const attrs = this.buildAttributes(fieldSchema);
    const fieldElement = parent.ele(tagName, attrs);

    for (const langId of fieldSchema.languages) {
      const value = values[langId.toString()];
      if (value !== undefined) {
        fieldElement.ele("language", { id: langId.toString() }).dat(value);
      }
    }
  }

  private handleAssociation(
    parent: XMLBuilder,
    assocName: string,
    assocSchema: AssociationSchema,
    rowData: Record<string, string>,
  ) {
    const container = parent.ele(assocName, {
      nodeType: assocSchema.nodeType,
      api: assocSchema.api,
    });

    // Process each CSV mapping using the registry
    for (const [csvField, mapping] of Object.entries(assocSchema.csvMapping)) {
      const csvValue = rowData[csvField];
      if (!csvValue) continue;

      const transformFn = this.transformRegistry[mapping.transform];
      if (transformFn) {
        transformFn(container, csvValue, rowData, assocSchema);
      } else {
        console.warn(
          `Transform function "${mapping.transform}" not found in registry`,
        );
      }
    }
  }

  // ========== Transform Functions ==========

  private transformToStockAvailable(
    container: XMLBuilder,
    _csvValue: string,
    _rowData: Record<string, string>,
    schema: AssociationSchema,
  ) {
    const stockElement = container.ele(schema.nodeType);

    // Create ID (usually 0 for new products, will be auto-generated)
    this.addSimpleField(stockElement, "id", "0", schema.fields["id"]);

    // id_product_attribute (0 = default combination)
    this.addSimpleField(
      stockElement,
      "id_product_attribute",
      "0",
      schema.fields["id_product_attribute"],
    );
  }

  private transformToImages(
    container: XMLBuilder,
    csvValue: string,
    _rowData: Record<string, string>,
    schema: AssociationSchema,
  ) {
    const imageUrls = csvValue.split(";").filter((url) => url.trim());

    for (const url of imageUrls) {
      const imageElement = container.ele(schema.nodeType);
      // If you want to add URLs directly, you can add custom fields
      imageElement.ele("url").dat(url.trim());
      // Or just add an empty image node as placeholder
      // imageElement.ele("id").dat("");
    }
  }

  private transformToCategory(
    container: XMLBuilder,
    csvValue: string,
    _rowData: Record<string, string>,
    schema: AssociationSchema,
  ) {
    const categoryIds = csvValue.split(",").filter((id) => id.trim());

    for (const categoryId of categoryIds) {
      const categoryElement = container.ele(schema.nodeType);
      this.addSimpleField(
        categoryElement,
        "id",
        categoryId.trim(),
        schema.fields["id"],
      );
    }
  }

  private transformToCombinations(
    container: XMLBuilder,
    csvValue: string,
    _rowData: Record<string, string>,
    schema: AssociationSchema,
  ) {
    // Handle combination data from CSV
    const combinationElement = container.ele(schema.nodeType);
    this.addSimpleField(
      combinationElement,
      "id",
      csvValue,
      schema.fields["id"],
    );
  }

  private transformToProductFeatures(
    container: XMLBuilder,
    csvValue: string,
    _rowData: Record<string, string>,
    schema: AssociationSchema,
  ) {
    const features = csvValue.split(";").filter((f) => f.trim());

    for (const feature of features) {
      const [featureId, featureValueId] = feature
        .split(":")
        .map((f) => f.trim());
      const featureElement = container.ele(schema.nodeType);

      if (featureId) {
        this.addSimpleField(
          featureElement,
          "id",
          featureId,
          schema.fields["id"],
        );
      }
      if (featureValueId) {
        this.addSimpleField(
          featureElement,
          "id_feature_value",
          featureValueId,
          schema.fields["id_feature_value"],
        );
      }
    }
  }

  private transformToTags(
    container: XMLBuilder,
    csvValue: string,
    _rowData: Record<string, string>,
    schema: AssociationSchema,
  ) {
    const tagIds = csvValue.split(",").filter((id) => id.trim());

    for (const tagId of tagIds) {
      const tagElement = container.ele(schema.nodeType);
      this.addSimpleField(tagElement, "id", tagId.trim(), schema.fields["id"]);
    }
  }

  private transformToAttachments(
    container: XMLBuilder,
    csvValue: string,
    _rowData: Record<string, string>,
    schema: AssociationSchema,
  ) {
    const attachmentIds = csvValue.split(",").filter((id) => id.trim());

    for (const attachmentId of attachmentIds) {
      const attachmentElement = container.ele(schema.nodeType);
      this.addSimpleField(
        attachmentElement,
        "id",
        attachmentId.trim(),
        schema.fields["id"],
      );
    }
  }

  private transformToAccessories(
    container: XMLBuilder,
    csvValue: string,
    _rowData: Record<string, string>,
    _schema: AssociationSchema,
  ) {
    const accessoryIds = csvValue.split(",").filter((id) => id.trim());

    for (const accessoryId of accessoryIds) {
      const productElement = container.ele("product");
      productElement
        .ele("id", {
          "xlink:href": `${this.apiUrl}/products/`,
          required: "true",
        })
        .dat(accessoryId.trim());
    }
  }

  private transformToProductBundle(
    container: XMLBuilder,
    csvValue: string,
    _rowData: Record<string, string>,
    _schema: AssociationSchema,
  ) {
    const bundleItems = csvValue.split(";").filter((item) => item.trim());

    for (const item of bundleItems) {
      const [productId, attributeId, quantity] = item
        .split(":")
        .map((i) => i.trim());
      const productElement = container.ele("product");

      productElement.ele("id", { required: "true" }).dat(productId);
      if (attributeId) {
        productElement.ele("id_product_attribute").dat(attributeId);
      }
      if (quantity) {
        productElement.ele("quantity").dat(quantity);
      }
    }
  }

  // Method to add custom transforms dynamically
  public registerTransform(name: string, fn: AssociationTransformFunction) {
    this.transformRegistry[name] = fn.bind(this);
  }

  public convertRowToXML(rowData: Record<string, string>): string {
    const doc = create({ version: "1.0", encoding: "UTF-8" });
    const root = doc.ele("prestashop", {
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
    });

    const product = root.ele(this.schema.rootTag);

    // 1. Process simple fields
    for (const [csvField, fieldSchema] of Object.entries(this.schema.fields)) {
      const value = rowData[csvField];
      this.addSimpleField(product, fieldSchema.xmlTag, value, fieldSchema);
    }

    // 2. Process multi-language fields
    for (const [csvField, fieldSchema] of Object.entries(
      this.schema.multiLangFields,
    )) {
      const values: Record<string, string> = {};

      for (const langId of fieldSchema.languages) {
        const csvHeader = `${csvField};language_id=${langId}`;
        if (rowData[csvHeader]) {
          values[langId.toString()] = rowData[csvHeader];
        }
      }

      if (Object.keys(values).length > 0) {
        this.addMultiLangField(
          product,
          fieldSchema.xmlTag,
          values,
          fieldSchema,
        );
      }
    }

    // 3. Process associations
    const associations = product.ele("associations");
    for (const [assocName, assocSchema] of Object.entries(
      this.schema.associations,
    )) {
      this.handleAssociation(associations, assocName, assocSchema, rowData);
    }

    return doc.end({ prettyPrint: true });
  }
}
