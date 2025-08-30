import style from "./style.module.css"


export default function StatusComponent({ isActive, title, description }: { isActive: boolean, title: string, description: string }) {

    return <div className={style.container}>
        <div className={style.main}>
            <div className={style["status-container"]}>
                <div className={`${style.status} ${isActive ? style.green : style.red}`} >
                </div>
            </div>
            <h2>{title}</h2>
        </div>
        <div className={style.description}>
            <p>{description}</p>
        </div>
    </div >
}