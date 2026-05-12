// src/pages/frontoffice/home/components/ProductCombinationSelectComponent.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFrontofficeData } from '@/hooks/useFrontofficeData';
import { fetchProductCombinations } from '../services';
import { getWithLanguage } from '@/utils/lang';
import { useLanguage } from '@/hooks/useLanguage';

interface CombinationOption {
  id: number;
  reference: string;
  price: number;
  ean13?: string;
  upc?: string;
  minimal_quantity: number;
  attributeNames: string[];
  // Group attributes by option name for better display
  attributesByGroup: Map<string, string>;
}

interface ProductCombinationSelectProps {
  productId: number;
  basePrice: number;
  onSelect: (combination: CombinationOption | null, price: number) => void;
}

export function ProductCombinationSelectComponent({
  productId,
  basePrice,
  onSelect,
}: ProductCombinationSelectProps) {
  const { data } = useFrontofficeData();
  const { language } = useLanguage();
  const [combinations, setCombinations] = useState<CombinationOption[]>([]);
  const [loading, setLoading] = useState(true);

  const languageId = language?.language_id || 1;

  const getAttributeDisplayName = useCallback(
    (optionValueId: number): string => {
      if (!data) return `Option #${optionValueId}`;

      const optionValue = data.productOptionValues.get(optionValueId);
      if (!optionValue) return `Option #${optionValueId}`;

      // Get the option value name in the current language
      const valueName = getWithLanguage(optionValue.name, languageId);
      return valueName || `Value #${optionValueId}`;
    },
    [data, languageId],
  );

  const getOptionGroupName = useCallback(
    (optionValueId: number): string => {
      if (!data) return '';

      const optionValue = data.productOptionValues.get(optionValueId);
      if (!optionValue) return '';

      // Find the parent option group
      const optionGroup = data.productOptions.get(
        parseInt(`${optionValue.id_attribute_group}`),
      );
      if (!optionGroup) return '';

      // Get the option group name in the current language
      const groupName = getWithLanguage(optionGroup.name, languageId);
      return groupName || `Group ${optionValue.id_attribute_group}`;
    },
    [data, languageId],
  );

  const loadCombinations = useCallback(async () => {
    if (!data) return;

    try {
      setLoading(true);
      const combinationsData = await fetchProductCombinations(
        productId,
        data.combinationsCache,
      );

      const combinationOptions = combinationsData.map((comb) => {
        const attributeNames: string[] = [];
        const attributesByGroup = new Map<string, string>();

        // Get option values for this combination
        if (comb.associations?.product_option_values?.product_option_value) {
          const optionValues = Array.isArray(
            comb.associations.product_option_values.product_option_value,
          )
            ? comb.associations.product_option_values.product_option_value
            : [comb.associations.product_option_values.product_option_value];

          // Get names for each option value
          for (const ov of optionValues) {
            const valueName = getAttributeDisplayName(ov.id);
            const groupName = getOptionGroupName(ov.id);

            attributeNames.push(valueName);
            if (groupName) {
              attributesByGroup.set(groupName, valueName);
            }
          }
        }

        return {
          id: comb.id,
          reference: comb.reference,
          price: comb.price,
          ean13: comb.ean13,
          upc: comb.upc,
          minimal_quantity: comb.minimal_quantity || 1,
          attributeNames,
          attributesByGroup,
        };
      });

      setCombinations(combinationOptions);
    } catch (error) {
      console.error('Error loading combinations:', error);
    } finally {
      setLoading(false);
    }
  }, [productId, data, getAttributeDisplayName, getOptionGroupName]);

  useEffect(() => {
    (async () => {
      loadCombinations()
    })();
  }, [loadCombinations]);

  const handleValueChange = async (value: string) => {
    if (value === 'default') {
      onSelect(null, basePrice);
      return;
    }

    const combinationId = parseInt(value);
    const combination = combinations.find((c) => c.id === combinationId);

    if (combination) {
      onSelect(combination, combination.price);
    }
  };

  if (loading) {
    return <div className="h-10 w-full bg-muted animate-pulse rounded-md" />;
  }

  if (combinations.length === 0) return null;

  return (
    <div className="space-y-1">
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select variant" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          {combinations.map((combination) => {
            // Build a nice display string
            let displayName : string;

            if (combination.attributesByGroup.size > 0) {
              // Show as "Size: Large, Color: Blue"
              displayName = Array.from(combination.attributesByGroup.entries())
                .map(([group, value]) => `${group}: ${value}`)
                .join(', ');
            } else if (combination.attributeNames.length > 0) {
              displayName = combination.attributeNames.join(', ');
            } else {
              displayName = combination.reference || `Variant #${combination.id}`;
            }

            return (
              <SelectItem
                key={combination.id}
                value={combination.id.toString()}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="truncate">{displayName}</span>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {combination.reference && `REF: ${combination.reference}`}
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}