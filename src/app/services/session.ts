"use server"

import { cookies } from "next/headers"

const sessionName = "token_name"
export async function SaveSession(value: string) {
    const cookiesStore = await cookies();
    cookiesStore.set(sessionName, value);
}
export async function IsSessionExist() {
    const cookiesStore = await cookies();
    return cookiesStore.has(sessionName)
}
export async function RemoveSession() {
    const cookiesStore = await cookies();
    cookiesStore.delete(sessionName)
}
export async function GetTokenValue() {
    const cookiesStore = await cookies();
    return cookiesStore.get(sessionName)?.value
}