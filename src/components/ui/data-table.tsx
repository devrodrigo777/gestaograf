import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface Column<T> {
  key: keyof T | 'actions';
  header: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((column) => (
              <TableHead key={String(column.key)} className="font-semibold">
                {column.header}
              </TableHead>
            ))}
            {(onEdit || onDelete) && (
              <TableHead className="font-semibold text-right">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                className="text-center py-8 text-muted-foreground"
              >
                Nenhum registro encontrado
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render
                      ? column.render(item)
                      : String(item[column.key as keyof T] ?? '')}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDelete(item)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
