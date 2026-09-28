import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Divider,
  Button,
  Chip,
  Popover,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import useTradeStore from "../../stores/tradeStore";
import useAppStore from "../../stores/appStore";

import { useState } from "react";

function PositionsUI({ runningTrade, typeOfPos}) {
  const closeRunningTrade = useTradeStore(s=>s.closeRunningTrade);
  const setNotification = useAppStore(s=>s.setNotification);
  const accBalance = useTradeStore(s=>s.accBalance);
  const setAccBalance = useTradeStore(s=>s.setAccBalance);
  const accType = useTradeStore(s=>s.accType);
  const activeTrades = useTradeStore(s=>s.runningTrades);

  const newPnl = activeTrades.find(trade=>{
    if (trade.id==runningTrade.id){
      return trade
    }
  })?.pnl

  //console.log("should be seeing new pnl:",newPnl, "sum:",accBalance[accType]+newPnl);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "footprint-popover" : undefined;

  // Safe fallback split check
  const symbol = runningTrade?.key?.split("|")[2] || "UNKNOWN";
  const isBuy = runningTrade?.direction?.toLowerCase() === "buy";
  const isPnlPositive = (runningTrade?.pnl || 0) >= 0;

  // Stop click from bubbling up to the Card's popover trigger
  const handleCloseTrade = (e) => {
    e.stopPropagation();
    // TODO: Connect your close trade action dispatcher here
    setNotification(`Closing trade ID: ${runningTrade.id}`);
    
    setAccBalance(accType,(accBalance[accType]+newPnl));
    closeRunningTrade(runningTrade.id);
    
  };

  return (
    <>
      <Card
        aria-describedby={id}
        onClick={handleClick}
        sx={{
          cursor: "pointer",
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          background: "background.paper",
          transition: "all 0.2s ease-in-out",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            borderColor: "primary.main",
            transform: "translateY(-1px)",
          },
        }}
      >
        <CardContent sx={{ p: "12px 16px", "&:last-child": { pb: "12px" } }}>
          <Stack
            direction="row"
            
            spacing={1.5} // Slightly tighter spacing to prevent overflow
            sx={{ width: "100%", overflow: "hidden" }} // Enforces card structural bounds
          >
            {/* Left: Identity and Position Intent */}
            <Stack direction="row"  spacing={1.5} sx={{ minWidth: 0, flexShrink: 1 }} >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: "monospace", fontSize: "0.95rem" }}>
                {symbol}
              </Typography>
              <Chip
                icon={isBuy ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                label={runningTrade.direction?.toUpperCase()}
                size="small"
                color={isBuy ? "success" : "error"}
                variant="light" // Falls back cleanly or looks great with theme customization
                sx={{ fontWeight: 700, fontSize: "0.7rem", height: "20px" }}
              />
            </Stack>

            {/* Middle: Financials metrics */}
            <Stack direction="row"  spacing={3}>
              

              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: "0.65rem", textTransform: "uppercase", fontWeight: 600 }}>
                  PnL
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    fontFamily: "monospace",
                    color: isPnlPositive ? "success.main" : "error.main",
                  }}
                >
                  {isPnlPositive ? `+${runningTrade.pnl}` : runningTrade.pnl}
                </Typography>
              </Box>
            </Stack>

            {/* Right: Quick Action Dismiss */}
            {typeOfPos=="open" && <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CloseIcon />}
              onClick={handleCloseTrade}
              sx={{
                borderRadius: "6px",
                textTransform: "none",
                fontSize: "0.75rem",
                py: 0.25,
                px: 1,
                minWidth: "auto",
                textOverflow: "ellipsis",
                flexShrink: 0
              }}
            >
              Close
            </Button>}
          </Stack>
        </CardContent>
      </Card>

      {/* Deep-Dive Metric Popover Breakdown */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 280,
              borderRadius: "12px",
              boxShadow: "0px 10px 30px rgba(0,0,0,0.12)",
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Popover Header */}
        <Box sx={{ p: 2, bgcolor: "action.hover" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}>
            Position Details
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
            ID: {runningTrade.id}
          </Typography>
        </Box>
        <Divider />

        {/* Metric Grid list Layout */}
        <Box sx={{ p: 2, display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 1.5, columnGap: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Symbol</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{symbol}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Direction</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: isBuy ? "success.main" : "error.main" }}>
              {runningTrade.direction}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Stake</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>${runningTrade.stake}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Pos Size</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>${runningTrade.positionSize}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Entry Price</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>{runningTrade.entryPrice}</Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" display="block">Exit Price</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>{runningTrade?.exitPrice??"N/A"}</Typography>
          </Box>
        </Box>

        <Divider />

        {/* Timestamps */}
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1, bgcolor: "background.paper" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Start Time(local time)</Typography>
              <Typography variant="caption" sx={{ fontFamily: "monospace", display: "block" }}>
                {new Date(runningTrade.startTime).toLocaleString()}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Candle Start(UTC time)</Typography>
              <Typography variant="caption" sx={{ fontFamily: "monospace", display: "block" }}>
                {new Date(runningTrade.candleStartTime).toUTCString()}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Candle Exit(UTC time)</Typography>
              <Typography variant="caption" sx={{ fontFamily: "monospace", display: "block" }}>
                {new Date(runningTrade?.candleExitTime??"N/A").toUTCString()}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Commission</Typography>
              <Typography variant="caption" sx={{ fontFamily: "monospace", display: "block" }}>
                {runningTrade.positionSize*0.001}
              </Typography>
            </Box>
          </Stack>
          {typeOfPos=="open" && <Stack direction="row" alignItems="center" spacing={1}>
            <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Stop Loss:</Typography>
              <Typography variant="caption" sx={{ fontFamily: "monospace", display: "block" }}>
                Take Profit
              </Typography>
            </Box>
          </Stack>}
        </Box>

        <Divider />

        {/* Popover Footer Context */}
        <Box sx={{ p: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "action.hover" }}>
          <Stack direction="row" spacing={0.5} alignItems="baseline">
            <Typography variant="caption" color="text.secondary">Current PnL:</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: "monospace", color: isPnlPositive ? "success.main" : "error.main" }}>
              {runningTrade.pnl}
            </Typography>
          </Stack>
          {typeOfPos=="open" && <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<CloseIcon />}
            onClick={(e)=>{
              //console.log("terminate clicked");
              handleCloseTrade(e);
            }}
            sx={{ borderRadius: "6px", textTransform: "none", fontSize: "0.75rem" }}
          >
            Terminate
          </Button>}
        </Box>
      </Popover>
    </>
  );
}

export default PositionsUI;
