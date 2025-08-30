import SwitchButton from "@/components/general/SwitchButton"
import style from "./style.module.css"


export default function SwitchControlComponent({ isActive, title, description, onActive, onDeactive }: { isActive: boolean, title: string, description: string, onActive: () => void, onDeactive: () => void }) {

    return <div className={style.container}>
        <div className={style.main}>
            <div className={style["status-container"]}>
                <div className={style.status} >
                </div>
            </div>
            <div className={style.controller}>
                <h2>{title}</h2>
                <SwitchButton onActive={onActive} onDeactive={onDeactive} defaultActive={isActive} />
            </div>
        </div>
        <div className={style.description}>
            <span>{description}</span>
        </div>
    </div >
}