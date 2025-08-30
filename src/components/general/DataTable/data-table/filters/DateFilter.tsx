import { Input } from "@/components/ui/input";


export default function DateFilterDataTable({ startDate, endDate, setStartDate, setEndDate }:
    { startDate: number, endDate: number, setStartDate: (x: number) => void, setEndDate: (x: number) => void }) {

    return (
        <>
            <Input
                placeholder="تاریخ شروع"
                value={startDate}
                type="number"

                onChange={(event) => {
                    const val = event.target.value;
                    if (val) {
                        setStartDate(parseInt(val));
                    } else {
                        setStartDate(0);
                    }
                }}
                className="max-w-sm ml-1 text-left"
            />
            <Input
                placeholder="تاریخ پایان"
                value={endDate}
                type="number"
                onChange={(event) => {
                    const val = event.target.value;
                    if (val) {
                        setEndDate(parseInt(val));
                    } else {
                        setEndDate(0);
                    }
                }}
                className="max-w-sm text-left"
            />
        </>
    );
}