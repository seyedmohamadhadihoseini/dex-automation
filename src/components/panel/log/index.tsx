"use client"

import { LogEntry } from "@/lib/types/logs"
import style from "./style.module.css"
import { useEffect, useRef } from "react";
import { getSimpleDateTime } from "@/lib/functions/time";
export default function LogsComponent({ logs }: { logs: LogEntry[] }) {
    const ref = useRef<HTMLLIElement>(null);

    useEffect(() => {
        if (ref.current) {
            // console.log("try to scroll")
            // ref.current.scrollIntoView();
        }
        console.log("our logs is ")
        console.log(logs)
    }, [logs])
    const logsListDisplay = logs.map((item, index) => <li className={style[item.type]}
        key={`${item.timestamp} ${Math.random()}`} ref={index == (logs.length - 1) ? ref : null}>
            <span className={style.info}>{getSimpleDateTime(new Date(item.timestamp))} --    </span>
            <span>{item.message}</span>
    </li>
    )
    return <div className={style.container}>
        <h1>Logs</h1>
        <div className={style.main}>
            <ul>
                {logsListDisplay}
            </ul>
        </div>
    </div>
}
