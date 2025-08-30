import { RemoveSession } from "@/app/services/session";
import { redirect } from "next/navigation";


export async function GET() {
    await RemoveSession();
    return redirect("/signin")
}