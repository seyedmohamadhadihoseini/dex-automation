"use client"

import { MdDashboard } from "react-icons/md";
import style from "./style.module.css"
import { LuSettings } from "react-icons/lu";
import { FaFolderOpen } from "react-icons/fa";
import { BiExit } from "react-icons/bi";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RemoveSession } from "../services/session";
export default function SideBarApp() {
    const pathname = usePathname();
    const [tabName,setTabName] = useState("");
    useEffect(()=>{
        setTabName(pathname.substring(pathname.lastIndexOf("/")+1,pathname.length))
    },[pathname])
    const router = useRouter();
    const displayLists = [{name:"dashboard",icon:<MdDashboard />, },{name:"inputs",icon:<LuSettings />},
    {name:"log" , icon:<FaFolderOpen />},
    ].map(item=><li key={item.name} className={item.name == tabName?style.active:""} onClick={()=>router.push(item.name)}> 
        {item.icon}
        <span>{item.name}</span>
    </li>)
    return <div className={style.sidelist}>
        {displayLists}    
        <li  className={tabName == "signout"?style.active:""} onClick={async()=>{
            await RemoveSession();
            router.refresh()
        }}>
            <BiExit />
            <span>signOut</span>
        </li>
    
    </div>
}