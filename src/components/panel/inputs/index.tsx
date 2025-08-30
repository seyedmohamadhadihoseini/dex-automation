"use client"
import { useRef } from "react"
import style from "./style.module.css"
import { toast } from "react-toastify";
import InputConfiguration from "@/lib/types/inputs";
export default function InputsPanelComponent({ updateConfiguration,data }: { data:InputConfiguration,updateConfiguration: ((formData: FormData) => Promise<{ success: boolean, message: string }>) }) {
    const formRef = useRef<HTMLFormElement>(null);
    return <form ref={formRef} className={style.container} onSubmit={async (e) => {
        e.preventDefault()
        if (formRef.current) {
            const formData = new FormData(formRef.current)
            const result = await updateConfiguration(formData)
            toast(result.message, {
                position: "top-left"
            })
        } else {
            toast("لطفا فرم را تکمیل کنین");
        }
    }}>
        <h1>Inputs</h1>
        <div className={style.row}>
            <div className={style.element}>
                <label htmlFor="">Liquidity(ETH)</label>
                <input type="number" defaultValue={data.liquidityETH} required name="liquidityETH" placeholder="مقدار حداقل لیکویدیتی مانند 3" />
            </div>
            <div className={style.element}>
                <label htmlFor="">Inputs Check(%)</label>
                <input type="number" defaultValue={data.inputsCheck} required name="inputsCheck" placeholder="درصد از کل ورود برای تایید مثلا 2" />
            </div>

        </div>

        <div className={style.row}>
            <div className={style.element}>
                <label htmlFor="">Tokens QTY</label>
                <input type="number" defaultValue={data.tokensQty} required name="tokensQty" placeholder="تعداد  کل توکن ها در سبد مانند 10" />
            </div>
            <div className={style.element}>
                <label htmlFor="">Buy Commission(%)</label>
                <input type="number" defaultValue={data.buyCommission} required name="buyCommission" placeholder="حداقل کمیسیون خرید مانند 10" />
            </div>
        </div>
        <div className={style.row}>
            <div className={style.element}>
                <label htmlFor="">Entry Value(ETH)</label>
                <input type="number" defaultValue={data.entryValueETH} required name="entryValueETH" placeholder="مقدار ورود در هر توکن مثلا 0.025" />
            </div>
            <div className={style.element}>
                <label htmlFor="">Sell Commission(%)</label>
                <input type="number" defaultValue={data.sellCommission} required name="sellCommission" placeholder="حداقل کمیسیون فروش مانند 10" />
            </div>
        </div>
        <div className={style.row}>
            <div className={style.element}>
                <label htmlFor="">Profit(%)</label>
                <input type="number" defaultValue={data.profit} required name="profit" placeholder="مقدار سود برای فروش هر توکن مثلا 500" />
            </div>
            <div className={style.element}>
                <label htmlFor="sales-posibility">Sales Posibility</label>
                <span>آیا امکان فروش توکن چک شود؟</span>
                <input type="checkbox" defaultChecked={data.salesPossibility} name="salesPossibility" id="sales-posibility" />
            </div>

        </div>
        <div className={`${style.row} ${style.rowall}`}>
            <div className={style.element}>
                <label htmlFor="">Wallet Private Key</label>
                <input type="text" defaultValue={data.walletPrivateKey} required name="walletPrivateKey" placeholder="کلید خصوصی ولت اصلی" />
            </div>
        </div>

        <button type="submit">Send</button>

    </form>
}