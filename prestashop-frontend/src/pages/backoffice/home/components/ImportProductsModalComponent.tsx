import { Dialog, DialogContent } from "@/components/ui/dialog";
import React, { useState, useRef } from "react";
import {
  type ImportedRow,
} from "../services";

import { importProductsFromFile } from "../import-services/product-import";
import { importVariantsFromFile } from "../import-services/variant-import";
import { importCustomersFromFile } from "../import-services/customer-import";
import { importImagesFromZip } from "../import-services/zip-import";

import { ImportConfigurationView } from "./import-data/ImportConfigurationView";
import { ImportResultsView } from "./import-data/ImportResultsView";
import { type ImportStep, type FileStates, type TotalStats } from "../services";
import { useLanguage } from "@/utils/lang";
import { toast } from "sonner";

export function ImportProductsModalComponent({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  // File states
  const [fileStates, setFileStates] = useState<FileStates>({
    products: null,
    variants: null,
    customers: null,
    zip: null,
  });

  const { language } = useLanguage();

  // Delimiter
  const [delimiter, setDelimiter] = useState(",");

  // , or . for decimal separator
  const [decimalSeparator, setDecimalSeparator] = useState(",");

  // Import workflow states
  const [currentStep, setCurrentStep] = useState(-1);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileProgress, setCurrentFileProgress] = useState(0);
  const [importComplete, setImportComplete] = useState(false);
  const [showResultsTable, setShowResultsTable] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState("products");

  // Statistics
  const [totalStats, setTotalStats] = useState<TotalStats>({
    totalProducts: 0,
    successProducts: 0,
    failedProducts: 0,
    totalVariants: 0,
    successVariants: 0,
    failedVariants: 0,
    totalCustomers: 0,
    successCustomers: 0,
    failedCustomers: 0,
    totalImages: 0,
    successImages: 0,
    failedImages: 0,
  });

  // Results data
  const [productsResults, setProductsResults] = useState<ImportedRow[]>([]);
  const [variantsResults, setVariantsResults] = useState<ImportedRow[]>([]);
  const [customersResults, setCustomersResults] = useState<ImportedRow[]>([]);
  const [imagesResults, setImagesResults] = useState<ImportedRow[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Refs
  const productsInputRef = useRef<HTMLInputElement>(null);
  const variantsInputRef = useRef<HTMLInputElement>(null);
  const customersInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const importSteps: ImportStep[] = [
    {
      id: "products",
      label: "Fichier 1 - Products",
      icon: "package",
      acceptedFiles: ".csv",
      required: true,
      description: "date_produit, nom, reference, prix_ttc, Taxe, categorie"
    },
    {
      id: "variants",
      label: "Fichier 2 - Variants",
      icon: "file-spreadsheet",
      acceptedFiles: ".csv",
      required: true,
      description: "reference, specificité, karazany, stock_initial, prix_vente_ttc"
    },
    {
      id: "customers",
      label: "Fichier 3 - Customers",
      icon: "file-text",
      acceptedFiles: ".csv",
      required: true,
      description: "date, nom, email, pwd, adresse, achat, etat"
    },
    {
      id: "zip",
      label: "Images Archive (ZIP)",
      icon: "archive",
      acceptedFiles: ".zip",
      required: true,
      description: "Product images referenced by name in CSV files"
    }
  ];

  const handleFileChange = (stepId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFileStates(prev => ({ ...prev, [stepId]: selectedFile }));
    setImportComplete(false);
    setProgress(0);
  };

  const handleDrop = (stepId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    const syntheticEvent = {
      target: { files: [droppedFile] }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    handleFileChange(stepId, syntheticEvent);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const isStepComplete = (stepId: string): boolean => {
    return !!fileStates[stepId as keyof FileStates];
  };

  const allRequiredStepsComplete = (): boolean => {
    return importSteps.every(step => isStepComplete(step.id));
  };

  const handleImport = async () => {
    setIsImporting(true);
    setProgress(0);
    setImportComplete(false);

    const languageIds = language.rawLanguages?.map(l => l.id) || [1, 2, 3];

    try {
      // Step 1: Products
      setCurrentStep(0);
      setCurrentFileProgress(0);

      const productsImportPromise = importProductsFromFile(
        fileStates.products!,
        delimiter,
        decimalSeparator,
        languageIds
      );

      let progressInterval = setInterval(() => {
        setCurrentFileProgress(prev => Math.min(prev + Math.random() * 15, 90));
        setProgress(prev => Math.min(prev + Math.random() * 2, 22));
      }, 200);

      const productsImport = await productsImportPromise;
      clearInterval(progressInterval);
      setCurrentFileProgress(100);
      setProgress(25);
      setProductsResults(productsImport.rows);

      // Step 2: Variants
      setCurrentStep(1);
      setCurrentFileProgress(0);

      const variantsImportPromise = importVariantsFromFile(
        fileStates.variants!,
        delimiter,
        decimalSeparator,
        languageIds
      );

      progressInterval = setInterval(() => {
        setCurrentFileProgress(prev => Math.min(prev + Math.random() * 15, 90));
        setProgress(prev => Math.min(prev + Math.random() * 2, 48));
      }, 200);

      const variantsImport = await variantsImportPromise;
      clearInterval(progressInterval);
      setCurrentFileProgress(100);
      setProgress(50);
      setVariantsResults(variantsImport.rows);

      // Step 3: Customers
      setCurrentStep(2);
      setCurrentFileProgress(0);

      const customersImportPromise = importCustomersFromFile(
        fileStates.customers!,
        delimiter,
        decimalSeparator,
        languageIds,
        language
      );

      progressInterval = setInterval(() => {
        setCurrentFileProgress(prev => Math.min(prev + Math.random() * 15, 90));
        setProgress(prev => Math.min(prev + Math.random() * 2, 73));
      }, 200);

      const customersImport = await customersImportPromise;
      clearInterval(progressInterval);
      setCurrentFileProgress(100);
      setProgress(75);
      setCustomersResults(customersImport.rows);

      // Step 4: ZIP Image Processing
      setCurrentStep(3);
      setCurrentFileProgress(0);

      const imagesResult = await importImagesFromZip(
        fileStates.zip!,
        (zipProgress) => {
          setCurrentFileProgress(zipProgress);
          setProgress(75 + (25 * zipProgress) / 100);
        }
      );

      setImagesResults(imagesResult.rows);

      setTotalStats({
        totalProducts: productsImport.summary.totalRows,
        successProducts: productsImport.summary.successCount,
        failedProducts: productsImport.summary.failedCount,
        totalVariants: variantsImport.summary.totalRows,
        successVariants: variantsImport.summary.successCount,
        failedVariants: variantsImport.summary.failedCount,
        totalCustomers: customersImport.summary.totalRows,
        successCustomers: customersImport.summary.successCount,
        failedCustomers: customersImport.summary.failedCount,
        totalImages: imagesResult.summary.totalRows,
        successImages: imagesResult.summary.successCount,
        failedImages: imagesResult.summary.failedCount,
      });

      setProgress(100);
      setIsImporting(false);
      setImportComplete(true);

      // Show success/error toasts
      const totalSuccess = productsImport.summary.successCount +
        variantsImport.summary.successCount +
        customersImport.summary.successCount +
        imagesResult.summary.successCount;
      const totalFailed = productsImport.summary.failedCount +
        variantsImport.summary.failedCount +
        customersImport.summary.failedCount +
        imagesResult.summary.failedCount;

      if (totalFailed === 0) {
        toast.success(`Import complete! ${totalSuccess} items processed successfully`);
      } else {
        toast.warning(`Import complete with ${totalFailed} errors`);
      }

    } catch (error) {
      console.error("Import error:", error);
      toast.error("Import failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFileStates({ products: null, variants: null, customers: null, zip: null });
    setCurrentStep(-1);
    setIsImporting(false);
    setProgress(0);
    setCurrentFileProgress(0);
    setImportComplete(false);
    setProductsResults([]);
    setVariantsResults([]);
    setCustomersResults([]);
    setImagesResults([]);
    setCurrentPage(1);
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onCloseClick={() => {
          setOpen(false);
          handleReset();
        }}
        className={`${showResultsTable ? 'sm:max-w-[95vw] h-[95vh]' : 'sm:max-w-225 max-h-[85vh]'} p-0`}
      >
        {showResultsTable ? (
          <ImportResultsView
            activeResultTab={activeResultTab}
            setActiveResultTab={setActiveResultTab}
            productsResults={productsResults}
            variantsResults={variantsResults}
            customersResults={customersResults}
            imagesResults={imagesResults}
            totalStats={totalStats}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onBack={() => setShowResultsTable(false)}
          />
        ) : (
          <ImportConfigurationView
            importSteps={importSteps}
            fileStates={fileStates}
            delimiter={delimiter}
            setDelimiter={setDelimiter}
            decimalSeparator={decimalSeparator}
            setDecimalSeparator={setDecimalSeparator}
            currentStep={currentStep}
            isImporting={isImporting}
            currentFileProgress={currentFileProgress}
            progress={progress}
            importComplete={importComplete}
            totalStats={totalStats}
            onFileChange={handleFileChange}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            isStepComplete={isStepComplete}
            allRequiredStepsComplete={allRequiredStepsComplete}
            onImport={handleImport}
            onCancel={() => setOpen(false)}
            onViewDetails={() => setShowResultsTable(true)}
            inputRefs={{
              products: productsInputRef,
              variants: variantsInputRef,
              customers: customersInputRef,
              zip: zipInputRef,
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}