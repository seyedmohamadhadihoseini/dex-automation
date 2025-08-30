import SignInComponent from "@/components/signin";
import LoginCheck from "./server";

export default  function SignInApp(){

return <div>
    <SignInComponent loginAction={LoginCheck}/>
</div>
}