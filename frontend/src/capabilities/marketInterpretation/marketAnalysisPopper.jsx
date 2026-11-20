
import React, { useState,useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  ClickAwayListener,
  Divider,
  FormControlLabel,
  FormGroup,
  Paper,
  Popper,
  Popover,
  Stack,
  Typography,
  IconButton,
  Tooltip
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";

import { List } from "react-window";

import useChartStore from "../../stores/chartStore";
import useAnalysisStore from "../../stores/analysisStore";

import useSwingStore from "../../stores/swingStore";
import MarketState from "./marketState"

const TIMEFRAMES = ["1min", "5min", "15min", "30min", "1h", "4h"];

function SymbolRow({ index, style, symbols,
  activeTrade, activePlatform, selection, setSelection }) {
  if (!symbols){
    return;
  }
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
  console.log("executing")
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

  const activePlatform = useAnalysisStore(s=>s.activePlatform);
  const activeTrade = useAnalysisStore(s=>s.activeTrade);
  const setSymbols = useAnalysisStore(s=>s.setSymbols);
  const selection = useAnalysisStore(s=>s.selection);
  const setSelection = useAnalysisStore(s=>s.setSelection);

  const symbolsKey = `${activePlatform}|${activeTrade}`;
  const symbols = useChartStore(s=>s.symbols[symbolsKey]);
  //useEffect(()=>console.log("in bottom bar",symbols),[symbols])
  
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
            rowCount={symbols?.length ?? 5}
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

  const platforms = useAnalysisStore(s=>s.platforms);
  const trades = useAnalysisStore(s=>s.trades);
  const setActive = useAnalysisStore(s=>s.setActive);

  const selection = useAnalysisStore(s=>s.selection);

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
              variant="outlined">
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
                <option key={trade} value={trade} disabled={trade=="cm"} >
                  {trade=="um"?"USD-M":"COIN-M"}</option>))}
              
            </select>
            {<SymbolSelector/>
            }
          </Box>
          

        </Box>
        
      </Popper>
    </Box>
    
  )
}




export default function MarketAnalysisPopper() {
  const [anchorEl, setAnchorEl] = useState(null);

  const selection = useChartStore(s=>s.selection)
  const timeframes = useAnalysisStore(s=>s.timeframes);

  const marketState = useSwingStore(s=>s.marketState);

  const analysisRunning = useAnalysisStore(s=>s.analysisRunning);
  const toggleAnalysisRunning = useAnalysisStore(s=>s.toggleAnalysisRunning);
  
  const [sendAlerts, setSendAlerts] = useState(false);

  const open = Boolean(anchorEl);

  const togglePopper = (event) => {
    setAnchorEl(prev=>{
      const curr = prev ? null : event.currentTarget;
      return curr
    });
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const toggleTimeframe = useAnalysisStore(s=>s.toggleTimeframe);

  //useEffect(()=>console.log(marketState),[marketState])

  return (
    <>
      {/* Popper Trigger */}
      <IconButton
        
        onClick={togglePopper}
      >
        <InsightsOutlinedIcon />
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
      >
        
          <Paper
            elevation={8}
            sx={{
              width: 360,
              maxWidth: "calc(100vw - 32px)",
              maxHeight: "85vh",
              overflowY: "auto",
              mt: 1,
              p: 2,
              border: 1,
              borderColor: "divider",
            }}
          >
            {/* Header */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <InsightsOutlinedIcon color="primary" />
              <Typography variant="h6">
                Market Analysis
              </Typography>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* SECTION 1: MARKET SELECT */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ mb: 1 }}
              >
                1. Market Select
              </Typography>

              <PickSymbol/>
              
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* SECTION 2: ANALYSIS TIMEFRAMES */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ mb: 1 }}
              >
                2. Analysis Timeframes
              </Typography>

              <FormGroup>
                {TIMEFRAMES.map((timeframe) => (
                  <FormControlLabel
                    key={timeframe}
                    control={
                      <Checkbox
                        size="small"
                        checked={timeframes.includes(timeframe)}
                        onChange={() => toggleTimeframe(timeframe)}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {timeframe}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* SECTION 3: ALERTS */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ mb: 1 }}
              >
                3. Alerts
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={sendAlerts}
                    onChange={(e) => setSendAlerts(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    Send alerts
                  </Typography>
                }
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* RUN ANALYSIS */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<InsightsOutlinedIcon />}
              onClick={()=>toggleAnalysisRunning(!analysisRunning)}
              disabled={timeframes.length === 0}
            >
              {analysisRunning ? "Stop Analysis" : "Start Analysis"}
            </Button>

            {/* ANALYSIS RESULTS */}
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ mb: 1 }}
              >
                Analysis Results
              </Typography>

              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  bgcolor: "background.default",
                }}
              >
                
                <MarketState />

                    
              </Paper>
            </Box>
          </Paper>
      
      </Popper>
    </>
  );
}
