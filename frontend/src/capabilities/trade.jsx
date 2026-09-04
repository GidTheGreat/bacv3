import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import BoltIcon from "@mui/icons-material/Bolt";
import StreamIcon from "@mui/icons-material/Stream";
import HistoryIcon from "@mui/icons-material/History";
import { Tooltip,IconButton } from "@mui/material";

export default function Trading(){
    return (
        <>
        <Tooltip title="Trade on hist data">
            <IconButton><HistoryIcon/></IconButton>
            </Tooltip>
        <Tooltip title="Trade on live data">
            <IconButton><BoltIcon/></IconButton></Tooltip>
        <Tooltip title="Trades">
            <IconButton><ReceiptLongIcon/></IconButton></Tooltip>

        </>
    )
} 