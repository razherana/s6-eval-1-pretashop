import { type LanguageData, type LanguageContextType, LanguageContext } from "@/contexts/LanguageContext";
import type { CurrencyReadXML, LanguageReadXML } from "@/pages/home/types";
import { getWithLanguage } from "@/utils/lang";
import { fetchFromPrestashopApi } from "@/utils/url";
import React, { useEffect, useState } from "react";
import { type ReactNode } from "react";
import { toast } from "sonner";

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguageId: number;
  initialCurrencyId: number;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLanguageId,
  initialCurrencyId,
}) => {
  const [language, setLanguageReact] = useState<LanguageData>();

  // Fetch language data based on initialLanguageId and set it to state
  useEffect(() => {
    async function fetchLanguage() {
      let languageData: { language: LanguageReadXML };

      // Fetch language data
      {
        const urlParams = new URLSearchParams({
          display: "[id, iso_code, name]",
          "filter[id]": initialLanguageId.toString(),
        });
        languageData = await fetchFromPrestashopApi<{
          language: LanguageReadXML;
        }>(
          `/languages/${initialLanguageId}?${urlParams.toString()}`,
          {
            method: "GET",
          },
        );
      }

      // Fetch currency data based on language's iso_code
      let currencyData: {
        currencies: {
          currency: CurrencyReadXML;
        }
      };

      if (languageData && languageData.language) {
        const urlParams = new URLSearchParams({
          display: "full",
          "filter[id]": initialCurrencyId.toString(),
        });
        currencyData = await fetchFromPrestashopApi<{
          currencies: {
            currency: CurrencyReadXML;
          }
        }>(
          `/currencies?${urlParams.toString()}`,
          {
            method: "GET",
          },
        );
      }

      if (languageData && languageData.language && currencyData && currencyData.currencies && currencyData.currencies.currency) {
        const newData = {
          iso_name: languageData.language.iso_code,
          name: languageData.language.name,
          currency: getWithLanguage(currencyData.currencies.currency.symbol, initialLanguageId),
          conversion_change: currencyData.currencies.currency.conversion_rate,
          language_id: initialLanguageId,
          currency_id: initialCurrencyId,
        };

        console.log("Fetched language and currency data:", newData);

        setLanguageReact(newData);
      }
    }

    fetchLanguage().catch((error) => {
      console.error("Error fetching language or currency data:", error);
      toast.error("Failed to load language or currency data. Please try again later.");
    });
  }, [initialCurrencyId, initialLanguageId]);

  const value: LanguageContextType = {
    language,
    setLanguage: (language: LanguageData) => {
      setLanguageReact(language)
    },
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};
