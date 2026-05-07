import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { parseCSV } from "@/utils/csv";
import { verifyProductData } from "../services";
import { toast } from "sonner";

interface RawProductCSV {
  [key: string]: string;
}

export function ImportProductsModalComponent({ open }: { open: boolean }) {
  const [separator, setSeparator] = useState(",");
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [importComplete, setImportComplete] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [rowResults, setRowResults] = useState<boolean[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setImportComplete(false);
      setProgress(0);
      setSuccessCount(0);
      setFailedCount(0);
      setErrors([]);
      setRowResults([]);
      setTotalRows(0);
      setHeaders([]);
    } else {
      alert("Please select a valid CSV file");
    }
  };

  // Real API call to import a product
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const importProduct = async (product: RawProductCSV, rowIndex: number): Promise<boolean> => {
    try {
      // Replace this with your actual API endpoint
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          // Send as xml data
          'Content-Type': 'application/xml',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to import product: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`Error importing product at row ${rowIndex + 1}:`, error);
      throw error;
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert("Please select a CSV file first");
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setSuccessCount(0);
    setFailedCount(0);
    setErrors([]);
    setRowResults([]);
    setTotalRows(0);
    setHeaders([]);

    try {
      const text = await file.text();

      // Parse CSV using the csv-parse library
      const parsedData = await parseCSV(text, separator);

      if (parsedData.length === 0) {
        alert("The CSV file contains no data rows");
        setIsImporting(false);
        setImportComplete(true);
        return;
      }

      // Extract headers from the first record
      const extractedHeaders = Object.keys(parsedData[0]);
      setHeaders(extractedHeaders);

      const total = parsedData.length;
      setTotalRows(total);

      let success = 0;
      let failed = 0;
      const importErrors: string[] = [];
      const results: boolean[] = [];

      // Process each row/product
      for (let i = 0; i < total; i++) {
        const product = parsedData[i];

        if (!verifyProductData(product, extractedHeaders)) {
          const errorMessage = `Row ${parsedData.indexOf(product) + 1}: Missing required fields.`;
          setErrors(prev => [...prev, errorMessage]);
          console.warn(errorMessage, product);
        }

        try {
          // Call the actual API to import the product
          // const isSuccess = await importProduct(product, i);
          const isSuccess = Math.random() > 0.2; // Simulate success/failure with 80% success rate

          if (isSuccess) {
            success++;
            setSuccessCount(success);
            results.push(true);
          } else {
            failed++;
            setFailedCount(failed);
            results.push(false);
            importErrors.push(`Row ${i + 1}: Failed to import product - ${JSON.stringify(product)}`);
          }
        } catch (error) {
          failed++;
          setFailedCount(failed);
          results.push(false);
          const errorMessage = error instanceof Error ? error.message : String(error);
          importErrors.push(`Row ${i + 1}: ${errorMessage}`);
        }

        // Update progress and results
        setRowResults([...results]);
        const currentProgress = Math.round(((i + 1) / total) * 100);
        setProgress(currentProgress);

        // Small delay to allow UI to update smoothly
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      setErrors(importErrors);
      setImportComplete(true);

      // Show final summary
      if (success === total) {
        toast.success(`Successfully imported all ${success} products!`);
      } else if (success > 0) {
        toast.warning(`Import completed: ${success} successful, ${failed} failed. Check the errors list for details.`);
      } else {
        toast.error(`Import failed: All ${failed} products failed to import. Check the errors list for details.`);
      }

    } catch (error) {
      console.error("Error parsing CSV:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Error reading or parsing the CSV file: ${errorMessage}`);
      setErrors(prev => [...prev, `CSV Parsing Error: ${errorMessage}`]);
      setImportComplete(true);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
      setImportComplete(false);
      setProgress(0);
      setSuccessCount(0);
      setFailedCount(0);
      setErrors([]);
      setRowResults([]);
      setTotalRows(0);
      setHeaders([]);
    }
  };

  const successPercentage = totalRows > 0 ? (successCount / totalRows) * 100 : 0;
  const failedPercentage = totalRows > 0 ? (failedCount / totalRows) * 100 : 0;

  // Function to download error report
  const downloadErrorReport = () => {
    if (errors.length === 0) return;

    const report = {
      timestamp: new Date().toISOString(),
      totalRows,
      successCount,
      failedCount,
      errors,
      headers,
      separator
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-errors-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-225 p-0">
        <div className="flex h-150">
          {/* Left Panel - Import Configuration */}
          <div className="flex-1 p-6 flex flex-col">
            <DialogHeader className="mb-6">
              <DialogTitle>Import Products from CSV</DialogTitle>
              <DialogDescription>
                Upload a CSV file and configure the import settings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 flex-1">
              {/* File Upload Area */}
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">CSV files only</p>
                  </div>
                )}
              </div>

              {/* Separator Configuration */}
              <div className="space-y-2">
                <Label htmlFor="separator">CSV Separator</Label>
                <Input
                  id="separator"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  placeholder="Enter separator (default: ,)"
                  maxLength={1}
                  disabled={isImporting}
                />
                <p className="text-xs text-muted-foreground">
                  Common: comma (,), semicolon (;), tab (\t), pipe (|)
                </p>
              </div>

              {/* Headers Preview (if available) */}
              {headers.length > 0 && !isImporting && (
                <div className="space-y-2">
                  <Label>Detected Columns</Label>
                  <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md max-h-24 overflow-y-auto border-2">
                    {headers.map((header, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-white border rounded-md">
                        {header}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar (only during import) */}
              {isImporting && (
                <div className="space-y-2">
                  <Label>Import Progress</Label>
                  <div className="flex gap-1 rounded-lg overflow-hidden bg-gray-100 p-1">
                    {successCount > 0 && (
                      <div
                        className="h-2 bg-emerald-400 rounded-md transition-all duration-500 ease-in-out"
                        style={{ width: `${successPercentage}%` }}
                      />
                    )}
                    {failedCount > 0 && (
                      <div
                        className="h-2 bg-rose-400 rounded-md transition-all duration-500 ease-in-out"
                        style={{ width: `${failedPercentage}%` }}
                      />
                    )}
                    <div
                      className="h-2 bg-gray-200 rounded-md transition-all duration-500 ease-in-out flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">{progress}% complete</p>
                  <p className="text-xs text-center text-muted-foreground">
                    Processing row {successCount + failedCount} of {totalRows}...
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => window.close()}>
                Cancel
              </Button>
              {importComplete && errors.length > 0 && (
                <Button variant="outline" onClick={downloadErrorReport}>
                  Download Error Report
                </Button>
              )}
              <Button
                onClick={handleImport}
                disabled={!file || isImporting}
              >
                {isImporting ? "Importing..." : "Start Import"}
              </Button>
            </div>
          </div>

          {/* Right Panel - Import Results */}
          <div className="w-80 border-l bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold text-sm">Import Results</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!isImporting && !importComplete && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Start an import to see results here</p>
                </div>
              )}

              {/* Stats Cards */}
              {(isImporting || importComplete) && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-lg p-3 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-medium text-emerald-700">Success</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-600">{successCount}</p>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-rose-100">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="h-4 w-4 text-rose-500" />
                        <span className="text-xs font-medium text-rose-700">Failed</span>
                      </div>
                      <p className="text-2xl font-bold text-rose-600">{failedCount}</p>
                    </div>
                  </div>

                  {/* Summary Progress Bar */}
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xs font-medium mb-2">Progress</p>
                    <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-gray-200 mb-2">
                      {successCount > 0 && (
                        <div
                          className="bg-emerald-500 transition-all duration-500"
                          style={{ width: `${successPercentage}%` }}
                        />
                      )}
                      {failedCount > 0 && (
                        <div
                          className="bg-rose-500 transition-all duration-500"
                          style={{ width: `${failedPercentage}%` }}
                        />
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{totalRows} total rows</span>
                      <span>{progress}%</span>
                    </div>
                  </div>

                  {/* Row-by-row indicators */}
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xs font-medium mb-2">Row Status</p>
                    <div className="flex gap-0.5 flex-wrap max-h-24 overflow-y-auto">
                      {Array.from({ length: Math.min(totalRows, 150) }).map((_, index) => {
                        if (index < rowResults.length) {
                          return (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-sm transition-all duration-300 ${rowResults[index]
                                ? "bg-emerald-400"
                                : "bg-rose-400"
                                }`}
                              title={`Row ${index + 1}: ${rowResults[index] ? 'Success' : 'Failed'}`}
                            />
                          );
                        } else {
                          return (
                            <div
                              key={index}
                              className="w-2 h-2 rounded-sm bg-gray-200"
                            />
                          );
                        }
                      })}
                      {totalRows > 150 && (
                        <span className="text-xs text-muted-foreground ml-2 self-center">
                          +{totalRows - 150} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Errors List */}
                  {errors.length > 0 && (
                    <div className="bg-white rounded-lg border border-rose-100 overflow-hidden">
                      <div className="p-3 border-b border-rose-100 bg-rose-50">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-rose-500" />
                          <p className="text-xs font-medium text-rose-700">
                            Errors ({errors.length})
                          </p>
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {errors.map((error, index) => (
                          <div
                            key={index}
                            className="p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                          >
                            <p className="text-xs text-gray-600 whitespace-pre-wrap wrap-break-word">
                              {error}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}