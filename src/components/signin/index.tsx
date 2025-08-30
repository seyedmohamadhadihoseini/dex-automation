"use client"
import { useState } from "react";
import style from "./style.module.css";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
export default function SignInComponent({ loginAction }: { loginAction: ((formData: FormData) => Promise<boolean>) }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter()
    return <div className={style.container}>
        <form onSubmit={async(e)=>{
            e.preventDefault()
            const data = new FormData()
            data.append("username",username);
            data.append("password",password);
            
            const isLogined =await loginAction(data)
            if(isLogined){
                router.push("/panel/dashboard")
            }else{
                toast("your credential is false",{
                    position:"top-right"
                });
            }
        }}>
            <h1>login</h1>
            <input type="text" required name="username" placeholder="enter username" value={username} onChange={e => setUsername(e.target.value)} />
            <input type="password" required name="password" placeholder="enter password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit">login</button>
        </form>
    </div>
}