"use client"

import {
    ColumnDef,
    ColumnFiltersState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableHeader,
} from "@/components/ui/table"
import { useState } from "react";

import { useSelector } from "react-redux";
import { RootState } from "../store";
import PaginationDataTable from './pagination';
import DataTableBody from './body';
import HeaderDataTable from "./header";
import AddButtonDataTable from "./operations/AddButton";
import UnitSearchFilterDataTable from "./filters/UnitSearch";





interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    isHeaderDirVertical: boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isHeaderDirVertical
}: DataTableProps<TData, TValue>) {

    const [sectionFilters, setSectionFilters] = useState<ColumnFiltersState>([]);
    const SortingFilter = useSelector((state: RootState) => state.datatable.columnSort);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setSectionFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            columnFilters: sectionFilters
        }
    })
    return (
        <div>
            <div className="rounded-md border">
                <Table >
                    <TableHeader >
                        <HeaderDataTable table={table} isHeaderDirVertical={isHeaderDirVertical} />
                    </TableHeader>
                    <TableBody>
                        <DataTableBody table={table} SortingFilter={SortingFilter} columns={columns} />
                    </TableBody>
                </Table>
                <PaginationDataTable table={table} />
            </div>
        </div>
    )
}
