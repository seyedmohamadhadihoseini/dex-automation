"use client";

import { GetCustomColumns } from "./columns"
import { DataTable } from "./data-table"
import { store } from './store';
import { Provider } from 'react-redux';

export interface HeadersTypes {
    [key: string]: string|number;
}
export default function ShadcnDataTable({ headers, data, buttons, isHeaderDirVertical = false }:
    {
        headers: string[], data: HeadersTypes[],
        buttons: { title: string, color: string,columnNames: string[], clickHandler: (row: { [key: string]: string }) => void }[],
        isHeaderDirVertical: boolean

    }) {
    const columns = GetCustomColumns(headers, buttons);
    return (
        <Provider store={store}>
            <div className="container mx-auto py-10 ">
                <DataTable columns={columns} data={data} isHeaderDirVertical={isHeaderDirVertical} />
            </div>
        </Provider>
    )
}
