"use server"

import { SaveSession } from "@/app/services/session";

export default async function LoginCheck(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const loginData = {
        username, password
    }
    const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST", body: JSON.stringify(loginData), headers: {
            'Content-Type': `application/json`
        }
    })
    if (!response.ok) {
        console.log("invalid user account");
        return false
    }
    const { access_token } = await response.json()
    await SaveSession(access_token);
    return true
}