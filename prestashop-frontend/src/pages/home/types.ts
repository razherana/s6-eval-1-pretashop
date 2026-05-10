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
      image?: [
        {
          "@_xlink:href": string;
        },
      ];
    };
  };
  price: number;
}

export interface OrderReadXML {
  id: number;
  reference: string;
  total_paid: number;
  payment: string;
  current_state: string;
  order_details?: OrderDetailReadXML[];
}

export interface OrderDetailReadXML {
  id: number;
  id_order: number;
  product_id: {
    "#text": number;
  };
  product_name: string;
  product_quantity: number;
  product_price: number;
  total_price_tax_incl: number;
  product_reference: string;
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
