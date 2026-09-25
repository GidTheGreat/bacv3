import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import BoltIcon from "@mui/icons-material/Bolt";
import StreamIcon from "@mui/icons-material/Stream";
import HistoryIcon from "@mui/icons-material/History";
import { Tooltip,IconButton } from "@mui/material";
import useTradeStore from "../stores/tradeStore"

export default function Trading(){
    return (
        <>
        
        <Tooltip title="Trading Mode">
            <IconButton onClick={()=>useTradeStore.getState().setTradeMode(!useTradeStore.getState().tradeMode)}>
                <AccountBalanceWalletIcon/></IconButton></Tooltip>
            

        </>
    )
} 