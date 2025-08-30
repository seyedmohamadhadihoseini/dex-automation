"use server";

import { GetTokenValue } from "@/app/services/session";
async function SendPostRequest(part: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/trading/${part}`, {
        method: "POST", headers: {
            'Authorization': `Bearer ${await GetTokenValue()}`
        }
    })
    const { message } = await response.json();
    return message
}
export async function StartServer() {
    return await SendPostRequest("server/start");
}
export async function StopServer() {
    return await SendPostRequest("server/stop");
}
export async function PairListStart() {
    return await SendPostRequest("pair-listen/start");
}
export async function PairListStop() {
    return await SendPostRequest("pair-listen/stop");
}
export async function TokenSell(address: string) {
    return await SendPostRequest(`tokens/${address}/sell`);
}
export async function TokenStop(address: string) {
    return await SendPostRequest(`tokens/${address}/stop`);
}

