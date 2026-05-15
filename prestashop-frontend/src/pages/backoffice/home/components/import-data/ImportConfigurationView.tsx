import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React from "react";
import { CheckCircle, Upload, Eye, Loader2, AlertCircle } from "lucide-react";
import { FileUploadStep } from "./FileUploadStep";
import { ImportStatsSummary } from "./ImportStatsSummary";
import { type ImportStep, type FileStates, type TotalStats, type InputRefs } from "../../services";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImportConfigurationViewProps {
  importSteps: ImportStep[];
  fileStates: FileStates;
  delimiter: string;
  setDelimiter: (delimiter: string) => void;
  decimalSeparator: string;
  setDecimalSeparator: (separator: string) => void;
  dateFormat: string;
  setDateFormat: (format: string) => void;
  bigError: string;
  currentStep: number;
  isImporting: boolean;
  currentFileProgress: number;
  progress: number;
  importComplete: boolean;
  totalStats: TotalStats;
  onFileChange: (stepId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (stepId: string, e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  isStepComplete: (stepId: string) => boolean;
  allRequiredStepsComplete: () => boolean;
  onImport: () => void;
  onCancel: () => void;
  onViewDetails: () => void;
  inputRefs: InputRefs;
}

export function ImportConfigurationView({
  importSteps,
  fileStates,
  delimiter,
  setDelimiter,
  decimalSeparator,
  setDecimalSeparator,
  dateFormat,
  setDateFormat,
  bigError,
  currentStep,
  isImporting,
  currentFileProgress,
  progress,
  importComplete,
  totalStats,
  onFileChange,
  onDrop,
  onDragOver,
  isStepComplete,
  allRequiredStepsComplete,
  onImport,
  onCancel,
  onViewDetails,
  inputRefs,
}: ImportConfigurationViewProps) {
  return (
    <div className="flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Import Products Data
          </DialogTitle>
          <DialogDescription>
            Upload your 3 CSV files (Products, Variants, Customers) and the ZIP archive of product images
          </DialogDescription>
        </DialogHeader>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {bigError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error during import</AlertTitle>
            <AlertDescription>{bigError}</AlertDescription>
          </Alert>
        )}

        {/* Delimiter Configuration */}
        <div className="space-y-2">
          <Label htmlFor="delimiter">CSV Delimiter</Label>
          <Input
            id="delimiter"
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            placeholder="Enter delimiter (default: ,)"
            maxLength={1}
            disabled={isImporting}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Common: comma (,), semicolon (;), tab (\t), pipe (|)
          </p>
        </div>

        {/* Decimal Separator Configuration */}
        <div className="space-y-2">
          <Label htmlFor="decimalSeparator">Decimal Separator</Label>
          <Input
            id="decimalSeparator"
            value={decimalSeparator}
            onChange={(e) => setDecimalSeparator(e.target.value)}
            placeholder="Enter decimal separator (default: ,)"
            maxLength={1}
            disabled={isImporting}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Common: comma (,) or period (.)
          </p>
        </div>

        {/* Date Format Configuration */}
        <div className="space-y-2">
          <Label htmlFor="dateFormat">Date Format</Label>
          <Input
            id="dateFormat"
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            placeholder="Enter date format (default: dd/MM/yyyy)"
            disabled={isImporting}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Common: dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd
          </p>
        </div>

        {/* File Upload Steps */}
        <div className="space-y-4">
          {importSteps.map((step, index) => (
            <FileUploadStep
              key={step.id}
              step={step}
              isActive={currentStep === index && isImporting}
              isComplete={isStepComplete(step.id)}
              isImporting={isImporting}
              currentFileProgress={currentStep === index ? currentFileProgress : undefined}
              selectedFile={fileStates[step.id as keyof FileStates]}
              onFileChange={(e) => onFileChange(step.id, e)}
              onDrop={(e) => onDrop(step.id, e)}
              onDragOver={onDragOver}
              inputRef={inputRefs[step.id as keyof InputRefs]}
            />
          ))}
        </div>

        {/* Overall Progress */}
        {(isImporting || importComplete) && (
          <ImportStatsSummary
            progress={progress}
            importComplete={importComplete}
            totalStats={totalStats}
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t px-6 py-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {allRequiredStepsComplete() && !isImporting && (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            )}
            <span>
              {allRequiredStepsComplete()
                ? "All files ready for import"
                : "Upload all required files to continue"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} disabled={isImporting}>
              Cancel
            </Button>
            {importComplete && (
              <Button
                variant="outline"
                onClick={onViewDetails}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            )}
            <Button
              onClick={onImport}
              disabled={!allRequiredStepsComplete() || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Start Import
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}