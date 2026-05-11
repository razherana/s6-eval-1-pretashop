import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { type ImportedRow } from "../../services";

interface ResultsTableProps {
  headers: string[];
  rows: ImportedRow[];
}

export function ResultsTable({ headers, rows }: ResultsTableProps) {
  return (
    <Table>
      <TableHeader className="sticky top-0 bg-white z-10">
        <TableRow>
          <TableHead className="w-16 text-center">Row</TableHead>
          <TableHead className="w-20 text-center">Status</TableHead>
          {headers.map((header, index) => (
            <TableHead key={index} className="min-w-40 font-semibold">{header}</TableHead>
          ))}
          <TableHead className="min-w-60">Message</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.index}
            className={`${
              row.success
                ? 'bg-emerald-50/30 hover:bg-emerald-100/50'
                : 'bg-rose-50/30 hover:bg-rose-100/50'
            } transition-colors`}
          >
            <TableCell className="text-center font-mono text-xs">
              {row.index}
            </TableCell>
            <TableCell className="text-center">
              {row.success ? (
                <CheckCircle className="h-4 w-4 text-emerald-500 inline-block" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-500 inline-block" />
              )}
            </TableCell>
            {headers.map((header, index) => (
              <TableCell key={index} className="text-xs max-w-48 truncate">
                {row.data[header] || '-'}
              </TableCell>
            ))}
            <TableCell className="text-xs max-w-60">
              {row.error ? (
                <span className="text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {row.error}
                </span>
              ) : row.warnings ? (
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {row.warnings[0]}
                </span>
              ) : (
                <span className="text-emerald-600">-</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}