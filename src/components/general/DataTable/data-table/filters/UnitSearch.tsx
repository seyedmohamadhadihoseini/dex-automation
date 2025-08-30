import { Input } from "@/components/ui/input";
import { Table } from "@tanstack/react-table";

export default function UnitSearchFilterDataTable<TData>({ table }: { table: Table<TData> }) {

    return <Input
        placeholder="جستجو با کدملی"
        type="number"
        value={(table.getColumn("کد ملی")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
            table.getColumn("کدملی")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
    />
}