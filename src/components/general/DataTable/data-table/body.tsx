import { TableCell, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, Table } from "@tanstack/react-table";

export default function DataTableBody<TData, TValue>({ table, SortingFilter, columns }: {
    table: Table<TData>, SortingFilter: {
        columnNameSort: string;
        columnSortIsAsc: boolean;
    }, columns: ColumnDef<TData, TValue>[]
}) {

    return <>
        {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.sort((row1, row2) => {
                const a = parseInt(row1.getValue(SortingFilter.columnNameSort));
                const b = parseInt(row2.getValue(SortingFilter.columnNameSort));
                const c = SortingFilter.columnSortIsAsc
                if ((c && a > b) || (!c && a < b)) {
                    return 1
                } else if ((c && a < b) || (!c && a > b)) {
                    return -1;
                }
                return 0
            }).map((row) => {

                return (
                    <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                    </TableRow>
                )
            })
        ) : (
            <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-right">
                    داده ای وجود ندارد.
                </TableCell>
            </TableRow>
        )}
    </>
}