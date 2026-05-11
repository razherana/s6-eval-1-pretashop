import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { type ImportedRow, type TotalStats } from "../../services";
import { ResultsHeader } from "./ResultsHeader";
import { ResultsTabs } from "./ResultsTabs";
import { ResultsPagination } from "./ResultsPagination";
  
interface ImportResultsViewProps {
  activeResultTab: string;
  setActiveResultTab: (tab: string) => void;
  productsResults: ImportedRow[];
  variantsResults: ImportedRow[];
  customersResults: ImportedRow[];
  imagesResults: ImportedRow[];
  totalStats: TotalStats;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onBack: () => void;
}

export function ImportResultsView({
  activeResultTab,
  setActiveResultTab,
  productsResults,
  variantsResults,
  customersResults,
  imagesResults,
  totalStats,
  currentPage,
  setCurrentPage,
  onBack,
}: ImportResultsViewProps) {
  const rowsPerPage = 25;

  const resultsMap = {
    products: productsResults,
    variants: variantsResults,
    customers: customersResults,
    images: imagesResults,
  };

  const headersMap = {
    products: ["date_produit", "nom", "reference", "prix_ttc", "Taxe", "categorie"],
    variants: ["reference", "specificité", "karazany", "stock_initial", "prix_vente_ttc"],
    customers: ["date", "nom", "email", "pwd", "adresse", "achat", "etat"],
    images: ["file", "reference", "productId", "imageId"],
  };

  const allResults = resultsMap[activeResultTab as keyof typeof resultsMap] || [];
  const headers = headersMap[activeResultTab as keyof typeof headersMap] || [];
  
  const totalPages = Math.ceil(allResults.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = allResults.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col h-full">
      {/* Back Button */}
      <div className="px-6 pt-6 pb-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <ResultsHeader totalStats={totalStats} />

      <ResultsTabs
        activeResultTab={activeResultTab}
        setActiveResultTab={(tab) => {
          setActiveResultTab(tab);
          setCurrentPage(1);
        }}
        productsCount={productsResults.length}
        variantsCount={variantsResults.length}
        customersCount={customersResults.length}
        imagesCount={imagesResults.length}
        headers={headers}
        rows={currentRows}
      />

      <ResultsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={Math.min(endIndex, allResults.length)}
        total={allResults.length}
        onPrevious={() => setCurrentPage(Math.max(1, currentPage - 1))}
        onNext={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
      />
    </div>
  );
}