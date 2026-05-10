import { getWithLanguage, upperFirstLetter, useLanguage } from "@/utils/lang";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Globe, DollarSign } from "lucide-react";
import { useState } from "react";

export function SelectLanguageCurrency() {
  const { language, setLanguage, setCurrency } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleLanguageChange = (languageId: string) => {
    const selected = language.rawLanguages.find((lang) => lang.id.toString() === languageId);
    if (selected) {
      setLanguage(selected);
    }
  };

  const handleCurrencyChange = (currencyId: string) => {
    const selected = language.rawCurrencies.find((curr) => curr.id.toString() === currencyId);
    if (selected) {
      setCurrency(selected);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-1.5 h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          <span>{language.language_code.toUpperCase()} / {language.currency}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-4" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Language
            </Label>
            <Select
              value={language.language_id.toString()}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {language.rawLanguages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id.toString()}>
                    {lang.name} ({lang.iso_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              Currency
            </Label>
            <Select
              value={language.currency_id.toString()}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {language.rawCurrencies.map((curr) => (
                  <SelectItem key={curr.id} value={curr.id.toString()}>
                    {upperFirstLetter(getWithLanguage(curr.names, language.language_id))}
                    {curr.symbol && ` (${getWithLanguage(curr.symbol, language.language_id)})`}
                    {curr.conversion_rate !== 1 && ` (${curr.conversion_rate})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}