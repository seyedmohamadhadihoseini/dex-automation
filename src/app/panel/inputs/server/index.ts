"use server"

import { GetTokenValue } from "@/app/services/session"
import InputConfiguration from "@/lib/types/inputs"

export async function updateConfiguration(formData: FormData) {

    const data = {
        liquidityETH: Number(formData.get("liquidityETH") as string),
        inputsCheck: Number(formData.get("inputsCheck") as string),
        tokensQty: Number(formData.get("tokensQty") as string),
        buyCommission: Number(formData.get("buyCommission") as string),
        entryValueETH: Number(formData.get("entryValueETH") as string),
        sellCommission: Number(formData.get("sellCommission") as string),
        profit: Number(formData.get("profit") as string),
        salesPossibility: formData.get("salesPossibility") ? true : false,
        walletPrivateKey: formData.get("walletPrivateKey") as string
    }

    const response = await fetch("http://localhost:3001/api/trading/inputs", {
        method: "PUT", body: JSON.stringify(data), headers: {
            'Content-Type': `application/json`,
            'Authorization': `Bearer ${await GetTokenValue()}`
        }
    })
    const message = await response.text()

    return {
        success: response.ok,
        message
    }
}
export async function ReadConfiguration() {
    const response = await fetch("http://localhost:3001/api/trading/inputs", {
        method: "GET", headers: {
            'Authorization': `Bearer ${await GetTokenValue()}`
        }
    })
    const result: InputConfiguration = await response.json()

    return result;
}