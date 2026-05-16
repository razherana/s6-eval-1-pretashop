import type { AssociationTransformFunction, DataXmlApiSchema, XmlApiSchema } from "@/utils/xml";

const transforms : Record<string, AssociationTransformFunction> = {
  toGroupsByIds: (container, groupIds: string, _rowData, _schema) => {
    
    groupIds.split(",").map(id => ({ id: parseInt(id.trim()) })).forEach(group => {
      const groupElement = container.ele("group");
      groupElement.ele("id").dat(group.id.toString());
    });

    console.log("Assigned groups with IDs:", groupIds);
  },
};

export const customerSchema: XmlApiSchema = {
  data: {
    rootTag: "customer",
    fields: {
      id: {
        xmlTag: "id",
        type: "simple",
        attributes: {},
      },
      id_lang: {
        xmlTag: "id_lang",
        type: "simple",
        attributes: { required: "true" },
      },
      id_default_group: {
        xmlTag: "id_default_group",
        type: "simple",
      },
      is_guest: {
        xmlTag: "is_guest",
        type: "simple",
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
      newsletter_date_add: {
        xmlTag: "newsletter_date_add",
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
    associations: {
      groups: {
        nodeType: "groups",
        api: "groups",
        fields: {
          id: {
            xmlTag: "id",
            type: "simple",
            attributes: { required: "true" },
          },
        },
        csvMapping: {
          groups: {
            transform: "toGroupsByIds",
          }
        }
      }
    },
  },
  transforms: transforms,
};




export default customerSchema;