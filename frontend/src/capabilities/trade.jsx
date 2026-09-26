import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { Tooltip,IconButton } from "@mui/material";
import useTradeStore from "../stores/tradeStore"

export default function Trading(){
    return (
        <>
        
        <Tooltip title="Trading Mode">
            <IconButton onClick={()=>useTradeStore.getState().setTradeMode(!useTradeStore.getState().tradeMode)}>
                <ReceiptLongIcon/></IconButton></Tooltip>
            

        </>
    )
} 