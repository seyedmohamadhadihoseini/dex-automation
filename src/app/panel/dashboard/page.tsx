"use client"
import DashboardComponent from "@/components/panel/dashboard";
import { useWebSocket } from "@/lib/WebSocketContext";


export default function DashboardApp() {
    const {data} = useWebSocket(); 
    
    return <DashboardComponent serverStatus={data.serverStatus} tokens={data.activeTokens} />
}