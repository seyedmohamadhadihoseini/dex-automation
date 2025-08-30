import { TableHead, TableRow } from "@/components/ui/table"
import { flexRender, Table } from "@tanstack/react-table"

export default function HeaderDataTable<TData>({ table, isHeaderDirVertical }: { table: Table<TData>, isHeaderDirVertical: boolean }) {


    return <>
        {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                    return (
                        <TableHead className={`text-center ${isHeaderDirVertical && "pt-10"}`} key={header.id}>
                            {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                        </TableHead>
                    )
                })}
            </TableRow>
        ))}
    </>
}