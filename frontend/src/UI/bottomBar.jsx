import {
  Paper,
  Stack,
  Typography,
  Button,
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Popper,
  Popover,
  Tooltip,
  Checkbox
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import Clock from "./time";
import { getCapabilities } from '../registry';
import useChartStore from '../stores/chartStore';

import {useEffect, useRef, useState} from 'react';

import ochestrator from '../ochestrator/main';
import useAppStore from "../stores/appStore";

import useConnStore from "../stores/connStore";

import { List } from "react-window";

function SymbolRow({ index, style, symbols,
  activeTrade, activePlatform, selection, setSelection }) {
  const symbol = symbols[index];

  return (
    <div style={style}>
      <FormControlLabel
        control={
          <Checkbox
            onChange={e=>setSelection(activePlatform,activeTrade,e.target.value)}
            checked={selection[`${activePlatform}|${activeTrade}`]?.has(symbol) ?? false}
            value={symbol}
          />
        }
        label={symbol}
      />
    </div>
  );
}

function SymbolSelector(){
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const id = open
    ? "symbols-popover"
    : undefined;

  const activePlatform = useConnStore(s=>s.activePlatform);
  const activeTrade = useConnStore(s=>s.activeTrade);
  const setSymbols = useConnStore(s=>s.setSymbols);
  const selection = useConnStore(s=>s.selection);
  const setSelection = useConnStore(s=>s.setSelection);

  const symbols = useConnStore(s=>s.symbols);

  async function fetchSymbols(){
    //console.log(market, market=="cm")
    if (activePlatform=="binance"){
      //console.log("evaluating symbols")
      if (activeTrade=="um"){
        //console.log("fetching um")
        const resp = await fetch("https://fapi.binance.com/fapi/v1/exchangeInfo");
        const exchangeInfo = await resp.json();
        const symbols = exchangeInfo.symbols.map(symbolInfo=>symbolInfo.symbol);
        
        setSymbols(symbols);
      } else if (activeTrade=="cm"){
        const resp = await fetch("https://dapi.binance.com/dapi/v1/exchangeInfo");
        
        const exchangeInfo = await resp.json();
        
        const symbols = exchangeInfo.symbols.map(symbolInfo=>symbolInfo.symbol);
        
        setSymbols(symbols);
      }
        
    }
  }

  useEffect(()=>{fetchSymbols()},[activePlatform,activeTrade])
  //useEffect(()=>{console.log(useConnStore.getState())},[selection])
  
  const selections = selection[`${activePlatform}|${activeTrade}`]
  
  return (
    <Box>
      <Tooltip><Button
        aria-describedby={id}
        onClick={handleClick}
        variant="outlined"
        endIcon={<ArrowDropDownIcon />}

      >
        <Typography
          noWrap
          sx={{ maxWidth: 60 }}
        >
          {selections?.size && selections.size>0? Array.from(selections).join(",") : "select symbol"}
        </Typography>
        
      </Button></Tooltip>

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
        <Stack
          sx={{
            width: 150,
            height: 300,
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.2) transparent",

            "&::-webkit-scrollbar": {
                height: "4px",
            },
            "&::-webkit-scrollbar-track": {
                background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
                background: "rgba(255,255,255,0.2)",
                borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(255,255,255,0.4)",
            },
          }}
        >
          <List
            rowComponent={SymbolRow}
            rowCount={symbols.length}
            rowHeight={40}
            rowProps={{ symbols,activeTrade,activePlatform,selection,setSelection }}
            style={{
              height: "100%",
              width: "100%",
            }}
          />
        </Stack>
      </Popover>
    </Box>
  )

}

function PickSymbol(){
  const ws = useAppStore(state => state.ws);

  const platforms = useConnStore(s=>s.platforms);
  const trades = useConnStore(s=>s.trades);
  const setActive = useConnStore(s=>s.setActive);
  const [connState, setConnState] = useState("Connect")

  const selection = useConnStore(s=>s.selection);

  let totalSizeList = []
  
  Object.keys(selection).forEach(key=>{
    //console.log(selection[key].size)
    selection[key]? totalSizeList.push(selection[key].size) : null
  } 
  )

  let symbolsLen = totalSizeList.reduce((total, n) => total + n, 0)

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "replay-popper" : undefined;

  useEffect(()=>{ws?setConnState("Connected"):setConnState("Connect")},[ws])

  return (
    <Box>
      <Tooltip >
        <Button
              aria-describedby={id}
              onClick={(event) => {
                setAnchorEl((current) =>
                  current ? null : event.currentTarget
                );
              }}
              variant="outlined"
              startIcon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: ws ? "success.main" : "error.main",
                    boxShadow: (theme) =>
                      `0 0 6px ${
                        ws
                          ? theme.palette.success.main
                          : theme.palette.error.main
                      }`,
                  }}
                />
              }
              
            >
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>

              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ ml: 0.5 }}
              >
                {symbolsLen}
              </Typography>
              
        </Button>
      </Tooltip>
      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{
    zIndex: (theme) => theme.zIndex.modal,
  }}
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 8],
            },
          },
        ]}
      >
        <Box
          sx={{
            p: 1.5,
            width: 330,
            borderRadius: 1.5,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 8,
            
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1.2fr",
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
            <select onChange={e=>setActive("platform",e.target.value)}>
              {platforms.map(platform=>(
                <option key={platform} value={platform}>
                  {platform}</option>))}
              
            </select>

            <select onChange={e=>setActive("trade",e.target.value)}>
              {trades.map(trade=>(
                <option key={trade} value={trade}>
                  {trade=="um"?"USD-M":"COIN-M"}</option>))}
              
            </select>
            <SymbolSelector/>
          </Box>
          <Box
            sx={{
              display:"flex",
              justifyContent:"center"
            }}
          >
            <Tooltip title={connState=="Connected"? "Click to Disconnect" : "Click to Connect"}>
              <Button variant="contained"
            
              sx={{
                bgcolor: connState.toLowerCase().startsWith("failed")?"red":"Background.default"
              }}
              onClick={()=>{
                if (ws){
                  ochestrator.send("disconnect", 
                    {platform:"meta"}, "ws")

                } else {
                  if (symbolsLen<1){
                    //console.log("failed")
                    setConnState("Failed,Pick atleast One Symbol")
                    setTimeout(()=>setConnState("Connect"),5_000)
                    return;
                  }
                  ochestrator.send("connect", 
                    {selection}, "ws")
                    setConnState("Connecting....")
                }
                
              }}>
                  {connState}
              </Button>

            </Tooltip>
            
            
          </Box>

        </Box>
        
      </Popper>
    </Box>
    
  )
}

export default function BottomBar() {
  //console.count("bottom bar")
  
  const notification = useAppStore(state=>state.notification);
  
  
  useEffect(
    ()=>{
      ochestrator.startUp()
    return ()=> {ochestrator.cleanUp()}
    },[]
  )
  
  return (
    <Paper
      sx={{
        height: "100%",
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left */}

      <Stack
        direction="row"
        spacing={2}
      >
        
      <PickSymbol/>
      </Stack>

      {/* Center */}

      <marquee style={{color:"red"}}>{notification}</marquee>

      {/* Right */}

      <Stack
        direction="row"
        spacing={2}
      >
        <Clock/>

        
      </Stack>
    </Paper>
  );
}