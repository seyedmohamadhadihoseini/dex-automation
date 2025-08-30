"use client"
import { Token } from "@/lib/types/token"
import StatusControlComponent from "./status"
import style from "./style.module.css"
import TokenListComponent from "./tokenlist"
import { ServerStatus } from "@/lib/types/dashboard"

export default function DashboardComponent({ tokens, serverStatus }: { tokens: Token[], serverStatus: ServerStatus|null }) {


    return <div className={style.container}>
        <StatusControlComponent serverStatus={serverStatus} />
        <TokenListComponent tokens={tokens} />
    </div>
}