"use client"

import { ColumnDef } from "@tanstack/react-table"
import style from "./style.module.css"

interface HeadersTypes {
    [key: string]: string | number;
}

export function GetCustomColumns(headers: string[], buttons: { title: string, color: string, columnNames: string[], clickHandler: (row: { [key: string]: string }) => void }[]): ColumnDef<HeadersTypes>[] {


    const result: ColumnDef<HeadersTypes>[] = headers.map(tableHeader => {
        return {
            accessorKey: tableHeader,
            header: ({ }) => {
                // const isSortable = !["g"].includes(tableHeader);
                return <div>{tableHeader}</div>
            },
            cell: ({ row }) => {
                const value: string | number = `${row.getValue(tableHeader)}`

                return <div className="text-center">
                    <span dir="ltr" className="inline-block ">
                        {value}
                    </span>
                </div>
            }
        }
    })
    buttons?.forEach(button => {
        result.push({
            accessorKey: button.title,

            cell: ({ row }) => {

                return <div className={style["button-container"]}>
                    <button style={{ backgroundColor: button.color }} className={style.button}
                        onClick={() => {
                            const initialValue: { [key: string]: string } = {}
                            const colVals = button.columnNames.reduce((acc, curr) => {
                                return {
                                    ...acc, [curr]: `${row.getValue(curr)}`
                                }
                            }, initialValue)
                            button.clickHandler(colVals);
                        }}
                    >
                        {button.title}
                    </button>
                </div>

            }
        })
    })

    return result;
}
