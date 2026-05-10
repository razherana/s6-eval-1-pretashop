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
      let rawLanguages: LanguageReadXML[];

      // Fetch language data
      {
        const urlParams = new URLSearchParams({
          display: "full",
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

        rawLanguages = (await fetchFromPrestashopApi<{
          languages:{
            language: LanguageReadXML[];
          }
        }>(
          `/languages?${new URLSearchParams({
            display: "full",
          }).toString()}`,
          {
            method: "GET",
          },
        )).languages.language;

        console.log("Fetched  all language data:", rawLanguages);
      }

      // Fetch currency data based on language's iso_code
      let currencyData: {
        currencies: {
          currency: CurrencyReadXML;
        }
      };
      let rawCurrencies: CurrencyReadXML[];

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

        // Fetch all currencies for rawCurrencies
        rawCurrencies = (await fetchFromPrestashopApi<{
          currencies: {
            currency: CurrencyReadXML[];
          }
        }>(
          `/currencies?${new URLSearchParams({
            display: "full",
          }).toString()}`,
          {
            method: "GET",
          },
        )).currencies.currency;

        if (rawCurrencies && !Array.isArray(rawCurrencies))
          rawCurrencies = [rawCurrencies];
      }

      if (languageData && languageData.language && currencyData && currencyData.currencies && currencyData.currencies.currency) {
        const newData : LanguageData = {
          locale: languageData.language.locale,
          language_name: languageData.language.name,
          language_code: languageData.language.language_code,
          currency: getWithLanguage(currencyData.currencies.currency.symbol, initialLanguageId),
          currency_name: getWithLanguage(currencyData.currencies.currency.names, initialLanguageId),
          conversion_change: currencyData.currencies.currency.conversion_rate,
          language_id: initialLanguageId,
          currency_id: initialCurrencyId,
          rawLanguages,
          rawCurrencies
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
    setLanguage: (rawLanguage: LanguageReadXML) => {
      localStorage.setItem("languageId", rawLanguage.id.toString());

      setLanguageReact((prev) => {
        if (!prev) return prev;

        const currentCurrency = prev.rawCurrencies.find(c => c.id === prev.currency_id);

        if (!currentCurrency) {
          console.warn(`Current currency with ID ${prev.currency_id} not found in rawCurrencies.`);
          toast.warning("Current currency not found. Currency information may be outdated.");
          return prev;
        }

        const updatedLanguage: LanguageData = {
          ...prev,
          locale: rawLanguage.locale,
          language_name: rawLanguage.name,
          language_code: rawLanguage.language_code,
          currency: getWithLanguage(currentCurrency.symbol, rawLanguage.id),
          currency_name: getWithLanguage(currentCurrency.names, rawLanguage.id),
          language_id: rawLanguage.id,
        };

        return updatedLanguage;
      });
    },
    setCurrency: (rawCurrency: CurrencyReadXML) => {
      localStorage.setItem("currencyId", rawCurrency.id.toString());
      
      setLanguageReact((prev) => {
        if (!prev) return prev;

        const currentLanguage = prev.rawLanguages.find(l => l.id === prev.language_id);

        if (!currentLanguage) {
          console.warn(`Current language with ID ${prev.language_id} not found in rawLanguages.`);
          toast.warning("Current language not found. Language information may be outdated.");
          return prev;
        }

        const updatedLanguage: LanguageData = {
          ...prev,
          currency: getWithLanguage(rawCurrency.symbol, prev.language_id),
          currency_name: getWithLanguage(rawCurrency.names, prev.language_id),
          conversion_change: rawCurrency.conversion_rate,
          currency_id: rawCurrency.id,
        };

        return updatedLanguage;
      });
    }
  };

  return (
    <LanguageContext.Provider value={value} > {children}</LanguageContext.Provider >
  );
};
