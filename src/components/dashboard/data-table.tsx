"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useServerAction } from "@/hooks/use-server-action";
import type { ActionResult } from "@/lib/action-result";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

/**
 * Plain-props table wrapper shared across admin list pages (students, teachers,
 * inquiries, blogs, services, plans, countries, teacher applications, attendance).
 * No @tanstack/react-table — the app's row counts don't warrant it.
 *
 * Optional `selectable` + `bulkAction` add row checkboxes and a bulk-delete
 * toolbar. `bulkAction` should be backed by a single `deleteMany` call server-side
 * — that's what keeps bulk delete to one DB round trip instead of N.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  emptyLabel = "Nothing here yet.",
  selectable = false,
  bulkAction,
  bulkActionLabel = "Delete selected",
  bulkConfirmTitle = "Delete selected rows?",
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
  selectable?: boolean;
  bulkAction?: (ids: string[]) => Promise<ActionResult>;
  bulkActionLabel?: string;
  bulkConfirmTitle?: string;
}) {
  const router = useRouter();
  const [rawSelected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Intersect with the current rows so ids from a previous (now-stale) row set
  // — e.g. right after a bulk delete refreshes the list — never linger selected.
  const selected = useMemo(() => {
    const rowIds = new Set(rows.map((row) => row.id));
    const next = new Set(Array.from(rawSelected).filter((id) => rowIds.has(id)));
    return next.size === rawSelected.size ? rawSelected : next;
  }, [rows, rawSelected]);

  const { run, pending } = useServerAction(async () => {
    if (!bulkAction) return { ok: false, error: "No bulk action configured." };
    return bulkAction(Array.from(selected));
  });

  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));
  const someSelected = selected.size > 0 && !allSelected;

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted">
        {emptyLabel}
      </p>
    );
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.id)));
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onBulkConfirm() {
    run(new FormData(), () => {
      setConfirmOpen(false);
      toast.success(`${selected.size} deleted.`);
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {selectable && selected.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-accent/30 px-4 py-2.5">
          <p className="text-sm font-medium">{selected.size} selected</p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="gap-1.5"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4" /> {bulkActionLabel}
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? "cursor-pointer" : undefined}
              data-state={selectable && selected.has(row.id) ? "selected" : undefined}
            >
              {selectable && (
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(row.id)}
                    onCheckedChange={() => toggleRow(row.id)}
                    aria-label="Select row"
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {bulkAction && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={bulkConfirmTitle}
          description={`This will permanently delete ${selected.size} record${selected.size === 1 ? "" : "s"}. This action cannot be undone.`}
          confirmLabel="Delete"
          pending={pending}
          onConfirm={onBulkConfirm}
        />
      )}
    </div>
  );
}
