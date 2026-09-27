import { Slider, Box, IconButton, Paper, Stack, ToggleButton,
  ToggleButtonGroup,
  Typography, Popover, Tooltip, Button, TextField, Divider } from "@mui/material";
import PositionsUI from "./positionsUi"
import useTradeStore from "../../stores/tradeStore";
import useChartStore from "../../stores/chartStore";
import useAppStore from "../../stores/appStore";
import useReplayStore from "../../stores/replayStore";
import { useEffect, useState } from "react";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

function TradeOptions() {
  const activeTrade = useTradeStore((state) => state.activeTrade);

  const activeSymbol = useTradeStore((state) => state.activeSymbol);

  const activePlatform = useTradeStore((state) => state.activePlatform);

  const accType = useTradeStore(state=>state.accType);

  const setRunningTrade = useTradeStore(state=>state.setRunningTrade);

  const setNotification = useAppStore(state => state.setNotification);

  const replayActive = useReplayStore(state => state.replayActive);
  
  const replayState = useReplayStore(state=>state.replayState);

  const stake = useTradeStore((state) => state.stake);

  const setStake = useTradeStore((state) => state.setStake);

  const leverage = useTradeStore((state) => state.leverage);

  const setLeverage = useTradeStore((state) => state.setLeverage);
  
  const [ editingStake, setEditingStake ] = useState(false);

  const [ editingLev, setEditingLev ] = useState(false);


  const key = `${activePlatform}|${activeTrade}|${activeSymbol}`;

  const symbolsInfo = useChartStore((state) => state.symbolsInfo[key]);

  const data = useChartStore(state=>state.data?.[key]?.["1min"]?.data)
 

  const minNotional = Number(symbolsInfo?.find((f) => f.filterType === "MIN_NOTIONAL")?.notional);

  const isInvalid = ((stake*leverage) < minNotional) || (stake <= 0) || (leverage <= 0);

  function handleBuySellClick(buttonType){
    if (!data?.length){
      setNotification(`Failed to place ${buttonType.toUpperCase()} order, no data available 
      for market:${key}:${Math.ceil(Math.random()*10)}`) 
    } else {
      if (accType=="Practice"){
        if (!replayActive){
          setNotification(`Failed to place ${buttonType.toUpperCase()} order, 
          in PRACTICE MODE replay mode should be active to 
          simulate trading:${Math.ceil(Math.random()*10)}`)
        } else {
          if ((stake*leverage)< minNotional){
            setNotification(`Failed to place ${buttonType.toUpperCase()} order, 
          (stake X leverage) less than minimum:${Math.ceil(Math.random()*10)}`)
          return;
          }
          const cursor = replayState[key].cursor;
          const entryCandle = data[cursor];
          const id = Math.floor(Math.random()*1_000_000_000_000);
          const startTime = new Date().getTime();
          const candleStartTime = entryCandle.time*1000; //ms
          const entryPrice = entryCandle.close;
          
          setRunningTrade({id,startTime, candleStartTime,
             entryPrice, stake, positionSize:(stake*leverage),
             key, direction:buttonType, pnl:0})

          setNotification(`Success,Placed ${buttonType.toUpperCase()} order, 
          on market:${key}:${Math.ceil(Math.random()*10)}`)
        }
      }
    }
  }

  return (
    <>
      
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
        {editingStake ? 
          <TextField
              autoFocus
              value={stake}
              onChange={e =>
                  isFinite(Number(e.target.value)) ? setStake(Number(e.target.value)) : null
              }
              onBlur={() => {
                setEditingStake(false);
                isInvalid ? setStake(Math.ceil(minNotional/leverage)) : null
              }}
              onKeyDown={e => {
                  if (e.key === "Enter") {
                      setEditingStake(false);
                      isInvalid ? setStake(Math.ceil(minNotional/leverage)) : null
                  }
              }}
              variant="standard"
              error={isInvalid}
              helperText={isInvalid ? `Minimum: ${Math.ceil(minNotional/leverage)}` : undefined}
              sx={{
                  width: "60px",
                  backgroundColor: "",
                  "& input": {
                      fontSize: "small",
                      padding: 0,
                  },
              }}
          />:<Button variant="outlined" onDoubleClick={() => setEditingStake(true)}
          component="label">Stake: ${stake.toFixed(2)}</Button>}
        
        {editingLev ? <Slider
          value={leverage}
          onChange={(_, value) => setLeverage(value)}
          onBlur={() => setEditingLev(false)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              setEditingLev(false);
            }
          }}
          min={1}
          max={100}
          step={1}
          valueLabelDisplay="auto"
          marks
          sx={{ width: "80%" }}
        /> : <Button variant="outlined" onDoubleClick={() => setEditingLev(true)} component="label">
          Leverage: {leverage}X
        </Button>}
        
        <Button variant="outlined" onClick={()=>handleBuySellClick("buy")}
        sx={{
          backgroundColor:"green",
          color:"white"
          }}>Buy</Button>
        <Button variant="outlined"  onClick={()=>handleBuySellClick("sell")}
        sx={{
          backgroundColor:"red",
          color:"white"
          }}>Sell</Button>
      </Box>
      
    
    </>
  )

}

function SymbolSelector() {
  //console.log("SymbolSelector rendered", useChartStore.getState().symbols);
  const trades = useChartStore((state) => state.trade_types);
  const symbols = useChartStore((state) => state.symbols);
  
  const activeTrade = useTradeStore((state) => state.activeTrade);
  const setActiveTrade = useTradeStore((state) => state.setActiveTrade);

  const activeSymbol = useTradeStore((state) => state.activeSymbol);
  const setActiveSymbol = useTradeStore((state) => state.setActiveSymbol);

  const activePlatform = useTradeStore((state) => state.activePlatform);
  

  return (
    <>
      
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
       
          <select onChange={e=>setActiveTrade(e.target.value)} value={activeTrade}>
            {trades.map((trade) => (
              <option key={trade} value={trade}>
                {trade=="um"?"USD-M":"COIN-M"}
              </option>
            ))}
          </select>

          <select onChange={e=>setActiveSymbol(e.target.value)} value={activeSymbol}>
            {symbols[`${activePlatform}|${activeTrade}`].map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
      </Box>
      
    
    </>
  )

}

function AccountTypeSelector() {
  const accType = useTradeStore((state) => state.accType);
  const setAccType = useTradeStore((state) => state.setAccType);
  const accTypes = useTradeStore((state) => state.accTypes);

  const platforms = useChartStore((state) => state.platforms);
  

  return (
    <>
      
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
        <Tooltip title="
       Practice account is CONTROLLED BY YOU THUS YOU CAN EDIT AMOUNT. 
       Demo & Live accounts are controlled by the platform.">
          <select onChange={e=>setAccType(e.target.value)} value={accType}>
            {accTypes.map((accType) => (
              <option key={accType} value={accType} disabled={accType!="Practice"}>
                {accType}
              </option>
            ))}
          </select>
        </Tooltip>
    
        <Tooltip title="Multiple platforms support coming soon">
          <select disabled={accType=="Practice"} value="binance">
            <option value="binance">binance</option>
          </select>
        </Tooltip>
      </Box>
      
    
    </>
  )

}


function TradingBots() {
  return (
    <>
      <Typography variant="body2" color="text.secondary">
        COMING SOON
      </Typography>
    </>
  )
}

function DspOpenPositions(){
  const runningTrades = useTradeStore(s=>s.runningTrades);
  //console.log(runningTrades)
  if (runningTrades.length < 1) {return;}
  return (
    <Box
    sx={{display:"flex",flexDirection:"column"}}>
      {runningTrades.map(runningTrade=><PositionsUI typeOfPos={"open"} runningTrade={runningTrade}/>)}
    </Box>
  )
}

function DspClosedPositions(){
  const closedTrades = useTradeStore(s=>s.closedTrades);
  //console.log(runningTrades)
  if (closedTrades.length < 1) {return;}
  return (
    <Box
    sx={{display:"flex",flexDirection:"column"}}>
      {closedTrades.map(closedTrade=><PositionsUI typeOfPos={"close"} runningTrade={closedTrade}/>)}
    </Box>
  )
}

function MoreOnTrades(){
  const [ dspItem, setDspItem ] = useState("Positions")
  return (
    <>
      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        value={dspItem}
        onChange={(event, value) => {
          setDspItem(value);
          }
        }
        sx={{
          "& .MuiToggleButton-root": {
            flex: 1,
            minWidth: 0,
            py: 0.5,
            fontSize: 11,
            borderColor: "divider",
          },
        }}
      >
        <ToggleButton value={"Positions"}>Positions</ToggleButton>
        <ToggleButton value={"History"}>History</ToggleButton>
        <ToggleButton value={"Trading Bots"}>Trading Bots</ToggleButton>
      </ToggleButtonGroup>

      {dspItem=="Positions" && <DspOpenPositions/>}
      {dspItem=="History" && <DspClosedPositions/>}
      {dspItem=="Trading Bots" && <TradingBots/>}
   
 
    </>
  )
}

export default function TradePanel() {
  const accBalance = useTradeStore((state) => state.accBalance);
  const setAccBalance = useTradeStore((state) => state.setAccBalance);
  const accType = useTradeStore((state) => state.accType);
  
  const [ editing, setEditing ] = useState(false);
  editing && !(accType=="Practice") ? setEditing(false):null

  return (
    <Box
      sx={{
        gridArea: "trade",
        overflow: "auto",
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
      <Box sx={{gap:1, display:"flex", alignItems:"center", justifyContent:"center"}}>
        <Tooltip title="This is your account balance.
         It will change based on your trades and account type.">
          
          {editing ? 
          <TextField
              autoFocus
              value={accBalance[accType]}
              onChange={e =>
                  isFinite(Number(e.target.value)) ? setAccBalance(accType, Number(e.target.value)) : null
              }
              onBlur={() => setEditing(false)}
              onKeyDown={e => {
                  if (e.key === "Enter") {
                      setEditing(false);
                  }
              }}
              variant="standard"
              sx={{
                  width: "60px",
                  "& input": {
                      fontSize: "small",
                      padding: 0,
                  },
              }}
          />:<Button onDoubleClick={() => setEditing(true)}
          variant="outlined" startIcon={<AccountBalanceWalletIcon />}>
            ${accBalance[accType].toFixed(2)}
          </Button>}
        </Tooltip>

        <AccountTypeSelector/>

      </Box>

      <Divider sx={{my:0.5}}/>

      <SymbolSelector/>

      <Divider sx={{my:0.5}}/>

      <TradeOptions/>

      <Divider sx={{my:0.5}}/>

      <MoreOnTrades/>
      
    </Box>
  )
}