
import {
  Paper,
  Typography,
  Chip,
  Stack,
  Box
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

import useSwingStore from "../../stores/swingStore";

const marketState4 = {
  "binance|um|BTCUSDT": {
    "1min": "uptrend"
  }
};

export default function MarketState() {
  const marketState = useSwingStore(s=>s.marketState);
  return (
    <Stack spacing={2}>
      {Object.entries(marketState).map(([market, timeframes]) => {
        const [exchange, marketType, symbol] = market.split("|");

        return (
          <Paper
            key={market}
            elevation={2}
            sx={{ p: 2, borderRadius: 2 }}
          >
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {symbol}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {exchange.toUpperCase()} · {marketType.toUpperCase()}
                  </Typography>
                </Box>

                <Chip label="LIVE" color="success" size="small" />
              </Stack>

              {Object.entries(timeframes).map(([timeframe, trend]) => (
                <Stack
                  key={timeframe}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">
                    {timeframe}
                  </Typography>

                  <Chip
                    icon={trend === "uptrend"? <TrendingUpIcon />:
                    <TrendingDownIcon/>}
                    label={trend}
                    color={
                      trend === "uptrend"
                        ? "success"
                        : trend === "downtrend"
                        ? "error"
                        : "default"
                    }
                    variant="outlined"
                  />
                </Stack>
              ))}
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
