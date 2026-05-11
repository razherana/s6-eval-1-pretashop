import { Dialog, DialogContent } from "@/components/ui/dialog";
import React, { useState, useRef } from "react";
import {
  importCustomersFromFile,
  importProductsFromFile,
  importVariantsFromFile,
  summarizeZipArchive,
  type ImportSummary,
  type ImportedRow,
} from "../services";
import { ImportConfigurationView } from "./import-data/ImportConfigurationView";
import { ImportResultsView } from "./import-data/ImportResultsView";
import { type ImportStep, type FileStates, type TotalStats } from "../services";

export function ImportProductsModalComponent({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  // File states
  const [fileStates, setFileStates] = useState<FileStates>({
    products: null,
    variants: null,
    customers: null,
    zip: null,
  });

  // Delimiter
  const [delimiter, setDelimiter] = useState(",");

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
  });

  // Results data
  const [productsResults, setProductsResults] = useState<ImportedRow[]>([]);
  const [variantsResults, setVariantsResults] = useState<ImportedRow[]>([]);
  const [customersResults, setCustomersResults] = useState<ImportedRow[]>([]);

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

    const summaries: ImportSummary[] = [];

    // Step 1: Products
    setCurrentStep(0);
    setCurrentFileProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setCurrentFileProgress(i);
      setProgress(25 * (i / 100));
    }
    const productsImport = await importProductsFromFile(fileStates.products!, delimiter);
    setProductsResults(productsImport.rows);
    const productsSummary = productsImport.summary;
    summaries.push(productsSummary);

    // Step 2: Variants
    setCurrentStep(1);
    setCurrentFileProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 80));
      setCurrentFileProgress(i);
      setProgress(25 + 25 * (i / 100));
    }
    const variantsImport = await importVariantsFromFile(fileStates.variants!, delimiter);
    setVariantsResults(variantsImport.rows);
    const variantsSummary = variantsImport.summary;
    summaries.push(variantsSummary);

    // Step 3: Customers
    setCurrentStep(2);
    setCurrentFileProgress(0);
    for (let i = 0; i <= 100; i += 15) {
      await new Promise(resolve => setTimeout(resolve, 60));
      setCurrentFileProgress(i);
      setProgress(50 + 25 * (i / 100));
    }
    const customersImport = await importCustomersFromFile(fileStates.customers!, delimiter);
    setCustomersResults(customersImport.rows);
    const customersSummary = customersImport.summary;
    summaries.push(customersSummary);

    // Step 4: ZIP Processing
    setCurrentStep(3);
    setCurrentFileProgress(0);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setCurrentFileProgress(i);
      setProgress(75 + 25 * (i / 100));
    }
    summaries.push(await summarizeZipArchive(fileStates.zip!));

    setTotalStats({
      totalProducts: productsSummary.totalRows,
      successProducts: productsSummary.successCount,
      failedProducts: productsSummary.failedCount,
      totalVariants: variantsSummary.totalRows,
      successVariants: variantsSummary.successCount,
      failedVariants: variantsSummary.failedCount,
      totalCustomers: customersSummary.totalRows,
      successCustomers: customersSummary.successCount,
      failedCustomers: customersSummary.failedCount,
    });

    setProgress(100);
    setIsImporting(false);
    setImportComplete(true);
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