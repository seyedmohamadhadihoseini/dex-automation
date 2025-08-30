"use client"
import { useEffect, useState } from "react";
import style from "./style.module.css"
export default function SwitchButton({ defaultActive, onActive, onDeactive }: { defaultActive: boolean, onActive: () => void, onDeactive: () => void }) {
    const [state, setState] = useState(defaultActive);
    useEffect(()=>{
        setState(defaultActive);
    },[defaultActive])
    return <label className={style.switch}>
        <input type="checkbox" checked={state} onChange={e => {
            if (e.target.checked) {
                onActive();
            } else {
                onDeactive();
            }
            setState(e.target.checked)
        }} />
        <span className={`${style.slider} ${style.round}`}></span>
    </label>
}