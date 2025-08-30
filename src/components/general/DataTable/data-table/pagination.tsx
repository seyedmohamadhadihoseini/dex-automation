import { Button } from "@/components/ui/button";
import { Table } from "@tanstack/react-table";

export default function PaginationDataTable<TData>({table}:{table:Table<TData>}) {

    return <div className="flex items-center justify-end space-x-2 py-4">
        <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
        >
            قبلی
        </Button>
        <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
        >
            بعدی
        </Button>
    </div>
}