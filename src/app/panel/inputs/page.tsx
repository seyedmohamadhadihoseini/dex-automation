import InputsPanelComponent from "@/components/panel/inputs";
import {ReadConfiguration, updateConfiguration} from "./server";


export default async function InputsSettingApp() {
    const data = await ReadConfiguration()
    return <InputsPanelComponent  updateConfiguration={updateConfiguration} data={data}/>
}