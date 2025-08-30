import { NextRequest, NextResponse } from "next/server";
import { IsSessionExist } from "./app/services/session";

export default async function middleware(request:NextRequest){
    const { pathname } = request.nextUrl;
    const isForLogin = pathname.startsWith("/signin");
    const isForPanel = pathname.startsWith("/panel");

    if(isForLogin){
        if(await IsSessionExist()){
            return NextResponse.redirect(new URL("/panel/dashboard", request.url));
        }
    }else if(isForPanel){
        if(! await IsSessionExist()){
            return NextResponse.redirect(new URL("/signin", request.url));
        }
    }

}