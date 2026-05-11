import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import React from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Archive, FileSpreadsheet, Package } from "lucide-react";
import type { ImportStep } from "../../services";

interface StepIconProps {
  icon: "package" | "file-spreadsheet" | "file-text" | "archive";
  className?: string;
}

const iconMap = {
  "package": Package,
  "file-spreadsheet": FileSpreadsheet,
  "file-text": FileText,
  "archive": Archive,
};

function StepIcon({ icon, className }: StepIconProps) {
  const Icon = iconMap[icon];
  return <Icon className={className} />;
}

interface FileUploadStepProps {
  step: ImportStep;
  isActive: boolean;
  isComplete: boolean;
  isImporting: boolean;
  currentFileProgress?: number;
  selectedFile: File | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function FileUploadStep({
  step,
  isActive,
  isComplete,
  isImporting,
  currentFileProgress,
  selectedFile,
  onFileChange,
  onDrop,
  onDragOver,
  inputRef,
}: FileUploadStepProps) {
  return (
    <Card className={`${isActive ? 'ring-2 ring-blue-500' : ''} ${isComplete ? 'border-emerald-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Step Status */}
          <div className="shrink-0 mt-1">
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
          </div>

          {/* File Upload */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <StepIcon icon={step.icon} className="h-5 w-5" />
                  {step.label}
                  {step.required && (
                    <Badge variant="outline" className="text-xs text-rose-600 border-rose-200">
                      Required
                    </Badge>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              </div>
              {isImporting && isActive && currentFileProgress !== undefined && (
                <Badge variant="secondary" className="gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {currentFileProgress}%
                </Badge>
              )}
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isComplete
                  ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${isImporting ? 'pointer-events-none opacity-50' : ''}`}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept={step.acceptedFiles}
                onChange={onFileChange}
                className="hidden"
                disabled={isImporting}
              />
              {isComplete && selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-emerald-700">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.acceptedFiles} files only
                  </p>
                </div>
              )}
            </div>

            {/* Progress bar during import */}
            {isImporting && isActive && currentFileProgress !== undefined && (
              <div className="mt-3">
                <Progress value={currentFileProgress} className="h-1.5" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}