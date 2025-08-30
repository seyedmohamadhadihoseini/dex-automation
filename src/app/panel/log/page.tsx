"use client";

import LogsComponent from "@/components/panel/log";
import { useWebSocket } from "@/lib/WebSocketContext";

export default function LogApp() {
    const {data} = useWebSocket();
    return <LogsComponent logs={data.logs} />
}