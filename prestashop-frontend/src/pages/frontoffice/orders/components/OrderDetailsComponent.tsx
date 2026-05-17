// src/pages/frontoffice/orders/components/OrderDetailsComponent.tsx
import { useEffect, useState } from "react";
import { useFrontofficeData } from "@/hooks/useFrontofficeData";
import { getFormattedPrice, getWithLanguage } from "@/utils/lang";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Package } from "lucide-react";
import type { CombinationDetailXML, OrderDetailReadXML } from "@/pages/backoffice/home/types";
import { fetchOrderDetailsById } from "../services";
import type { FrontofficeData } from "../../home/services";
import { fetchFromPrestashopApi } from "@/utils/url";

interface OrderDetailsProps {
  orderId: number;
  language: {
    currency: string;
    conversion_change: number;
    locale: string;
    language_id: number;
  };
}

function buildCombinationName(combination: CombinationDetailXML, data: FrontofficeData, language_id: number): string {
  if (!combination.associations?.product_option_values?.product_option_value) {
    return `Variant #${combination.id}`;
  }

  let optionValues = combination.associations.product_option_values.product_option_value;
  optionValues = Array.isArray(optionValues) ? optionValues : [optionValues];

  const attributeNames = optionValues.map((optionValue) => {
    const optionValueDetail = data.productOptionValues.get(optionValue.id);
    if (!optionValueDetail) return `Option value unknown (ID: ${optionValue.id})`;

    const optionGroupId = typeof optionValueDetail.id_attribute_group === 'object'
      ? optionValueDetail.id_attribute_group["#text"]
      : optionValueDetail.id_attribute_group;

    const option = data.productOptions.get(optionGroupId);

    if (option && optionValueDetail) {
      return `${getWithLanguage(option.name, language_id)}: ${getWithLanguage(optionValueDetail.name, language_id)}`;
    }

    return `Option value unknown (ID: ${optionValue.id})`;
  });

  return attributeNames.join(", ");
}

export function OrderDetailsComponent({ orderId, language }: OrderDetailsProps) {
  const [details, setDetails] = useState<OrderDetailReadXML[]>([]);
  const [loading, setLoading] = useState(true);
  const { data } = useFrontofficeData();
  const [combinationsCache, setCombinationsCache] = useState<{
    [key: number]: CombinationDetailXML | null;
  }>({});
  const [combinationNames, setCombinationNames] = useState<{
    [key: number]: string | null;
  }>({});

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const orderDetails = await fetchOrderDetailsById(orderId);
        const detailsArray = Array.isArray(orderDetails) ? orderDetails : [orderDetails];
        setDetails(detailsArray);

        // Pre-fetch combination details for all products with attributes
        if (data) {
          const combIds = new Set<number>();
          detailsArray.forEach(detail => {
            const attrId = detail.product_attribute_id?.["#text"];
            if (attrId && attrId != 0) {
              combIds.add(attrId);
            }
          });

          // Fetch all combinations
          for (const combId of combIds) {
            if (!combinationsCache[combId]) {
              try {
                const response = await fetchFromPrestashopApi<{
                  combination: CombinationDetailXML;
                }>(`/combinations/${combId}?display=full`, { method: "GET" });

                const combinationData = response.combination;
                setCombinationsCache(prev => ({ ...prev, [combId]: combinationData }));

                if (combinationData) {
                  const name = buildCombinationName(combinationData, data, language.language_id);
                  setCombinationNames(prev => ({ ...prev, [combId]: name }));
                  setCombinationsCache(prev => ({ ...prev, [combId]: combinationData }));
                } else {
                  setCombinationsCache(prev => ({ ...prev, [combId]: null }));
                }
              } catch (error) {
                console.error(`Error fetching combination ${combId}:`, error);
                setCombinationsCache(prev => ({ ...prev, [combId]: null }));
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading order details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [combinationsCache, data, language.language_id, orderId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (details.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Package className="h-8 w-8 mb-2" />
        <p>No details available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {details.map((detail, index) => {
        const attributeId = detail.product_attribute_id?.["#text"];
        const combinationName = attributeId && attributeId != 0
          ? combinationNames[attributeId]
          : null;

        return (
          <div key={detail.id || index}>
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">
                    {detail.product_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    REF: {detail.product_reference}
                  </p>
                  {combinationName && (
                    <p className="text-xs text-primary mt-1">
                      {combinationName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="ml-2 font-medium">{detail.product_quantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Unit Price:</span>
                  <span className="ml-2 font-medium">
                    {getFormattedPrice(
                      parseFloat(detail.product_price.toString()),
                      language.currency,
                      language.conversion_change,
                      language.locale
                    )}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Total (tax incl.):</span>
                  <span className="ml-2 font-bold">
                    {getFormattedPrice(
                      parseFloat(detail.total_price_tax_incl.toString()),
                      language.currency,
                      language.conversion_change,
                      language.locale
                    )}
                  </span>
                </div>
              </div>
            </div>
            {index < details.length - 1 && <Separator className="mt-4" />}
          </div>
        );
      })}
    </div>
  );
}