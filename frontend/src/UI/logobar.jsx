import {
  AppBar,
  Toolbar,
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Popover,
  Tooltip
} from "@mui/material";

import ReplayIcon from "@mui/icons-material/Replay";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import FullscreenOutlinedIcon from "@mui/icons-material/FullscreenOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

import BidAskCathedralLogo from "./logo";
import { getCapabilities } from "../registry";
import ReplayButton from "../capabilities/replay/replayButton";

import LayoutControls from "./panelUtils/layoutControls";
import Journal from "../capabilities/journal/Journal";
import useMediaQuery from "@mui/material/useMediaQuery";
import FetchDataButton from "../capabilities/fetch";
import DevTools from "../capabilities/devTools";
import Trading from "../capabilities/trade";
import ochestrator from '../ochestrator/main';

import { CloudUploadIcon } from "lucide-react";
import { CloudUpload } from "lucide-react";
import { useEffect, useState } from "react";

import useConnStore from "../stores/connStore";

function ManualUpload(){
  const platforms = useConnStore(s=>s.platforms);
  const trades = useConnStore(s=>s.trades);

  const [ active, setActive ] = useState({
    exchange: "binance",
    market: "um",
    csvName: "",
    file: ""
  });

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const id = open
    ? "upload-popover"
    : undefined;

  //useEffect(()=>console.log(active,Boolean(active.file)),[active])
  
  return (
    <Box>
      <Tooltip title='Upload Data'><IconButton
        aria-describedby={id}
        onClick={handleClick}
        variant="outlined"

      >
        <CloudUploadIcon/>
        
      </IconButton></Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            gap: 1,
            fontFamily:"cursive",
            "& input": {
                minWidth: 0,
                height: 32,
                padding: "0 7px",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.default",
                color: "text.primary",
                outline: "none",
                fontSize: 12,
                cursor: "pointer",

                "&:focus": {
                  borderColor: "primary.main",
                },}
          }}
        >
          <Box
          sx={{
            fontFamily:"cursive"
          }}>
            <ul>
              <li>Upload file must be Zip containing only one CSV</li>
              <li>Choose the platform and market of CSV</li>
              <li>If name of Zip is not the name of CSV,
                type the name of CSV in field provided</li>
              <li>Else leave the field empty</li>
              <li>Expected format,zip:"[symbol]-aggTrades-[yyyy]-[mm]-[dd].zip",
                csv:"[symbol]-aggTrades-[yyyy]-[mm]-[dd].csv"</li>
            </ul>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr ",
              gap: 0.75,

              "& select": {
                width: "100%",
                minWidth: 0,
                height: 32,
                padding: "0 7px",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.default",
                color: "text.primary",
                outline: "none",
                fontSize: 12,
                cursor: "pointer",

                "&:focus": {
                  borderColor: "primary.main",
                },
              },
            }}
          >
            <select onChange={e=>setActive(prev=>({
              ...prev,
              exchange: e.target.value
            }))}>
              {platforms.map(platform=>(
                <option key={platform} value={platform}>
                  {platform}</option>))}
              
            </select>

            <select onChange={e=>setActive(prev=>({
              ...prev,
              market: e.target.value
            }))}>
              {trades.map(trade=>(
                <option key={trade} value={trade}>
                  {trade=="um"?"USD-M":"COIN-M"}</option>))}
              
            </select>

          </Box>

          <Box
          >
            <Button variant="outlined" component="label">
              {active.file==""|| !active.file?.name ?"Choose File":active.file?.name}
              <input  type="file"  hidden onChange={e=>{
              setActive(prev=>({
                ...prev,
                file: e.target.files[0]
              }))
            }}/>
            </Button>
            
          </Box>
          

          <Box
          >
            <label>CSV Name &nbsp;
              <input value={active.csvName} onChange={
                e=>{
                  setActive(prev=>({
                    ...prev,
                    csvName: e.target.value
                  }))
                }
              } placeholder="xyz.csv"/>
            </label>
          </Box>
          

          <Button disabled={active.file == "" || !active.file ? true : false} 
          onClick={()=>{
            ochestrator.send("upload", {
              exchange: active.exchange,
              market: active.market,
              file: active.file,
              csvName: active.csvName,
            }, "http")
            handleClose();

            }} variant="outlined">
            <CloudUpload/>
          </Button>

        </Box>
        
      </Popover>
    </Box>
  )
}

export default function LogoBar() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const Journal = getCapabilities("journal")[0].component;
  //console.log(Journal)
  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      sx={{
      borderRadius: 2,
      overflow: "hidden",
    }}
    >
      <Toolbar
        variant="dense"
        sx={{
          minHeight: 34,
          height: 34,
          px: 1,
          gap: 2,
        }}
      >
        {/* Branding */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexShrink: 0 }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <BidAskCathedralLogo size={28} />
          </Box>

          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "1.35rem",
              color: "secondary.main",
              whiteSpace: "nowrap",
            }}
          >
            {isMobile ? null : "BidAsk Cathedral"}
          </Typography>
        </Stack>

        {/* ================================================= */}
        {/* Primary Capabilities */}
        {/* ================================================= */}

        <Stack
          direction="row"
            spacing={1}
            sx={{
              flex: 1,
              overflowX: "auto",
              overflowY: "hidden",
              whiteSpace: "nowrap",

              "&::-webkit-scrollbar": {
                height: 4,
              },
            }}
        >
          {/* */}
          
        </Stack>

        {/* ================================================= */}
        {/* Global Actions */}
        {/* ================================================= */}

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexShrink: 0 }}
        >
          {<Trading/>}
          <ManualUpload/>
          <FetchDataButton/>
          <Journal/>
          <ReplayButton/>
          <LayoutControls/>
          <DevTools/>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}