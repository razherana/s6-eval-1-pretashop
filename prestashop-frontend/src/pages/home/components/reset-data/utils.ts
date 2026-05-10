import type { ProductReadXML, OrderReadXML, CustomerReadXML } from "../../types";
import type { DataItem, ResetType } from "../ResetDataModalComponent";

export const getItemName = (item: DataItem, type: ResetType): string => {
  switch (type) {
    case 'products': {
      const product = item as ProductReadXML;
      return product.name.language[0]?.['#text'] || 'Unnamed Product';
    }
    case 'orders': {
      const order = item as OrderReadXML;
      return `Order #${order.reference}`;
    }
    case 'customers': {
      const customer = item as CustomerReadXML;
      return `${customer.firstname} ${customer.lastname}`.trim() || 'Unnamed Customer';
    }
  }
};