"use client"
import style from "./style.module.css"
import StatusComponent from "./status"
import SwitchControlComponent from "./switch"
import BalanceComponnet from "./balance"
import { PairListStart, PairListStop, StartServer, StopServer } from "@/lib/connection"

import { useEffect, useState } from "react"
import { ServerStatus } from "@/lib/types/dashboard"

export default function StatusControlComponent({serverStatus}:{serverStatus:ServerStatus|null}) {
    
    const [isServerRunning,setIsServerRunning] = useState(serverStatus?.isServerRunning||false);
    const [isPairListenRunning,setIsPairListenRunning] = useState(serverStatus?.isPairListenRunning||false);


    useEffect(()=>{
        setIsServerRunning(serverStatus?.isServerRunning||false);
        setIsPairListenRunning(serverStatus?.isPairListenRunning||false);
    },[serverStatus])
    return <div className={style.container}>
        <div className={style.controller}>
            <div className={style.row}>
                <SwitchControlComponent title="Start Server" description="سرور روشن و خاموش میشود"
                     isActive={isServerRunning}
                     onActive={async () => { await StartServer()}} onDeactive={async() => { await StopServer() }}
                />
                <StatusComponent title="Server Status&nbsp;&nbsp;" description={"سرور به نرم افزار وصل "+ (isServerRunning?"هست":"نیست")}
                    isActive={isServerRunning}
                />
            </div>
            <div className={style.row}>
                <SwitchControlComponent title="Start Robot&nbsp;" description="امکان معامله روشن و خاموش میشود"
                    isActive={isPairListenRunning}
                     onActive={async() => {await PairListStart()  }} onDeactive={async() => { await PairListStop() }}
                />
                <StatusComponent title="Pair List Status" description={"خوانش توکن ها فعال "+(isPairListenRunning?"هست":"نیست")}
                    isActive={isPairListenRunning}
                />
            </div>
        </div>
        <div className={style.balance}>
            <BalanceComponnet balance={serverStatus?.totalWETH||""} />
        </div>
    </div>
}