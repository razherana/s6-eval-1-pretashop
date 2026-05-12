export interface LanguageField {
  language: [
    {
      "@_id": number;
      "#text": string;
    },
  ];
}

export interface ProductReadXML {
  id: number;
  name: LanguageField;
  associations: {
    images: {
      image?:
        | [
            {
              id: number;
              "@_xlink:href": string;
            },
          ]
        | [];
    };
    combinations: {
      combination?:
        | [
            {
              id: number;
            },
          ]
        | [];
    };
  };
  price: number;
  reference: string;
  id_tax_rules_group:
    | {
        "#text": number;
      }
    | "";
  price_ttc?: number;
}

export interface CombinationDetailXML {
  id: number;
  id_product: {
    "#text": number;
  };
  reference: string;
  price: number;
  ean13?: string;
  upc?: string;
  wholesale_price?: number;
  weight?: number;
  minimal_quantity?: number;
  default_on?: string;
  associations?: {
    product_option_values?: {
      product_option_value?:
        | Array<{
            id: number;
          }>
        | {
            id: number;
          };
    };
  };
}

export interface ProductOptionValueXML {
  id: number;
  name: LanguageField;
  id_attribute_group: string;
}

export interface ProductOptionXML {
  id: number;
  name: LanguageField;
  public_name: LanguageField;
  position: number;
}

export interface OrderReadXML {
  id: number;
  reference: string;
  total_paid: number;
  payment: string;
  current_state: {
    "#text": number;
  };

  // Not an association but manually added in the code after fetching order details
  order_details?: OrderDetailReadXML[];
}

export interface OrderDetailReadXML {
  id: number;
  id_order: number;
  product_id: {
    "#text": number;
  };
  product_attribute_id: {
    "#text": number;
  };
  product_name: string;
  product_quantity: number;
  product_price: number;
  total_price_tax_incl: number;
  product_reference: string;
}

export interface OrderStateXML {
  id: number;
  name: LanguageField;
  template: LanguageField;
  unremovable?: string;
  delivery?: string;
  hidden?: string;
  send_email?: string;
  module_name?: string;
  invoice?: string;
  color?: string;
  logable?: string;
  shipped?: string;
  paid?: string;
  pdf_delivery?: string;
  pdf_invoice?: string;
  deleted?: string;
}

export interface OrderHistoryXML {
  id: number;
  id_order: {
    "#text": number;
  };
  id_order_state: {
    "#text": number;
  };
  id_employee?: {
    "#text": number;
  };
  date_add: string;
}

export interface OrderPaymentXML {
  id: number;
  order_reference: string;
  id_currency: string;
  amount: number;
  payment_method: string;
  conversion_rate: number;
  transaction_id?: string;
  date_add: string;
}

export interface CustomerReadXML {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

export interface LanguageReadXML {
  id: number;
  iso_code: string;
  name: string;
  locale: string;
  language_code: string;
}

export interface CurrencyReadXML {
  id: number;
  iso_code: string;
  conversion_rate: number;
  symbol: LanguageField;
  names: LanguageField;
}

export interface CategoryReadXML {
  id: number;
  name: LanguageField;
  id_parent:
    | 0
    | {
        "#text": number;
      };
}

export interface TaxReadXML {
  id: number;
  rate: number;
  active: string;
  deleted: string;
  name: LanguageField;
}

export interface TaxRuleGroupReadXML {
  id: number;
  name: string;
  active: string;
}

export interface TaxRuleReadXML {
  id: number;
  id_tax_rules_group: {
    "#text": number;
  };
  id_country: string;
  id_tax: number;
  behavior: string;
}

export interface ProductOptionValueDetail {
  id: number;
  id_attribute_group: number;
  name: LanguageField;
  color?: string;
  position?: number;
}
