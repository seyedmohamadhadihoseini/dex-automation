import { WebSocketProvider } from "@/lib/WebSocketContext";
import SideBarApp from "./sidebar";
import style from "./style.module.css"
export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {


    return <WebSocketProvider>
        <div className={style.container}>
            <SideBarApp />
            <div className={style.child}>

                {children}
            </div>
        </div>
    </WebSocketProvider>
}
