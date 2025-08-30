import { Button } from "@/components/ui/button";
import {  useRouter } from "next/navigation";

export default function AddButtonDataTable(){
    const router = useRouter();
    
    return <Button className="mb-2 p-5 cursor-pointer" onClick={() => {
        

        router.push(`/users/add`);
    }}>
          افزودن بیمار
         </Button>
}