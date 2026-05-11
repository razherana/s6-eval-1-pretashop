import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { DeleteStatus } from "../ResetDataModalComponent";

interface DeleteStatusTableProps {
  statuses: DeleteStatus[];
}

export function DeleteStatusTable({ statuses }: DeleteStatusTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-15">Status</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="w-25">ID</TableHead>
          <TableHead className="w-50">Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {statuses.map((status) => (
          <TableRow key={status.id}>
            <TableCell>
              {status.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {status.status === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              {status.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
            </TableCell>
            <TableCell className="font-medium">{status.name}</TableCell>
            <TableCell className="text-muted-foreground">#{status.id}</TableCell>
            <TableCell className="text-xs text-red-500">{status.error || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}