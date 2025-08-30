import ShadcnDataTable, { HeadersTypes } from "@/components/general/DataTable";
import { Token } from "@/lib/types/token";
import { TokenSell, TokenStop } from "@/lib/connection";
import { toast } from "react-toastify";

export default function TokenListComponent({ tokens }: { tokens: Token[] }) {

    const tokensData = tokens.map((token, index) => ({
        index,
        Date: new Date(token.buyTime).toISOString().replace('/T/', ' ').replace(/\..+/, '').replace("T", " "),
        Name: token.name, Pair: token.pair, liquidityETH: token.liquidityETH,
        decimals: token.decimals.toString(), buyPrice: token.buyPrice, profit: token.profit.toString(),
    }))

    function SellTokenHandler(row: { [key: string]: string; }) {
        const index = Number(row["index"]);
        const address = tokens[index].address;

        TokenSell(address).then(message => {
            toast(message, {})
        })

    }
    function StopTokenHandler(row: { [key: string]: string; }) {
        const index = Number(row["index"]);
        const address = tokens[index].address;

        TokenStop(address).then(message => {
            toast(message);
        })
    }

    return <ShadcnDataTable data={tokensData}
        headers={["index", "Date", "Name", "Pair", "liquidityETH", "decimals", "buyPrice", "profit"]}
        buttons={[
            { title: "SELL", color: "blue", columnNames: ["index"], clickHandler: SellTokenHandler },
            { title: "STOP", color: "red", columnNames: ["index"], clickHandler: StopTokenHandler }
        ]}
        isHeaderDirVertical={false} />
}