
import style from "./style.module.css"
import Image from "next/image"
import balanceLogo from "@public/balance.png"
export default function BalanceComponnet({balance}:{balance:string}) {
    
    return <div className={style.container}>
        <div className={style.logo}>
            <Image alt="logo" src={balanceLogo}/>
        </div>
        <div className={style.main}>
            <h2>TOTAL:<span>(WETH)</span></h2>
            <p>{balance}</p>
        </div>
    </div>
}