export interface CreateOrderXML {
  id_address_delivery: number;
  id_address_invoice: number;
  id_cart: number;
  id_currency: number;
  id_lang: number;
  id_customer: number;
  id_carrier: number;
  module: string;
  payment: string;
  total_paid: number;
  total_paid_real: number;
  total_products: number;
  total_products_wt: number;
  conversion_rate: number;
}

export interface CartProduct {
  product_id: number;
  product_attribute_id?: number;
  quantity: number;
}

export interface CreateCartXML {
  id_currency: number;
  id_lang: number;
  id_customer?: number;
  id_guest?: number;
  products: CartProduct[];
}

export interface CartSummary {
  total_products: number;
  total_products_wt: number;
  total_shipping: number;
  total_shipping_tax_incl: number;
  total: number;
  total_tax: number;
}