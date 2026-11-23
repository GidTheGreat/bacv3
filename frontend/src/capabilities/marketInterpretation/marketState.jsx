
import { useEffect } from "react";

import {
  Paper,
  Typography,
  Chip,
  Stack,
  Box,
  Divider,
  LinearProgress,
} from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

import useSwingStore from "../../stores/swingStore";
import sendTelegramMessage from "../sendTelegram";

// Dummy structure: replace with actual store data later.
const dummyTimeframe = {
  trend: "uptrend",
  leg: 1,

  retracement: {
    fib: "38.2% - 50.0%",
    status: "active",
  },

  structure: {
    type: "BOS",
    direction: "bullish",
  },

  entry: {
    conditions: [
      { label: "Price enters Fib zone", met: true },
      { label: "Bullish BOS confirmed", met: true },
      { label: "Confirmation candle", met: false },
    ],

    optimalEntry: "67432 - 67450",
    optimalTP: "67520",
    optimalSL: "67410",
    rr: "1:2.5",
  },
};

const formatValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return "—";
  }
  return value;
};

function TimeframeCard({ timeframe, data }) {
  // Backward compatibility with existing trend strings.
  const tf =
    typeof data === "string"
      ? { ...dummyTimeframe, trend: data }
      : {
          ...dummyTimeframe,
          ...data,
          retracement: {
            ...dummyTimeframe.retracement,
            ...data?.retracement,
          },
          structure: {
            ...dummyTimeframe.structure,
            ...data?.structure,
          },
          entry: {
            ...dummyTimeframe.entry,
            ...data?.entry,
          },
        };

  const bullish = tf.trend === "uptrend";
  const bearish = tf.trend === "downtrend";

  const trendColor = bullish
    ? "success.main"
    : bearish
    ? "error.main"
    : "text.secondary";

  const structureType = tf.structure?.type || "—";

  const conditions = tf.entry?.conditions || [];

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {/* TIMEFRAME HEADER */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: "action.hover",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography fontWeight={800} color="primary.main">
            {timeframe}
          </Typography>

          {bullish ? (
            <TrendingUpIcon color="success" fontSize="small" />
          ) : bearish ? (
            <TrendingDownIcon color="error" fontSize="small" />
          ) : (
            <TrendingFlatIcon fontSize="small" />
          )}

          <Typography
            variant="body2"
            fontWeight={700}
            sx={{ color: trendColor }}
          >
            {tf.trend || "Unknown"}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Leg {formatValue(tf.leg)}
          </Typography>
        </Stack>

        <Chip
          size="small"
          label={structureType}
          color={
            structureType === "BOS"
              ? "success"
              : structureType === "CHoCH"
              ? "warning"
              : "default"
          }
          variant="outlined"
        />
      </Stack>

      <Box
        sx={{
          p: 1.5,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            md: "1fr 1fr 1.3fr 1.3fr",
          },
          gap: 2,
        }}
      >
        {/* RETRACEMENT */}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
          >
            RETRACEMENT
          </Typography>

          <Typography fontWeight={800} fontSize={14}>
            {formatValue(tf.retracement?.fib)}
          </Typography>

          <Chip
            size="small"
            label={tf.retracement?.status || "—"}
            sx={{ mt: 0.5 }}
            variant="outlined"
          />
        </Box>

        {/* STRUCTURE */}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
          >
            MARKET STRUCTURE
          </Typography>

          <Typography fontWeight={800} fontSize={14}>
            {structureType}
          </Typography>

          <Typography
            variant="caption"
            color={trendColor}
            fontWeight={600}
          >
            {formatValue(tf.structure?.direction)}
          </Typography>
        </Box>

        {/* ENTRY CONDITIONS */}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
          >
            ENTRY CONDITIONS
          </Typography>

          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {conditions.map((condition, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={0.7}
                alignItems="center"
              >
                {condition.met ? (
                  <CheckCircleIcon
                    sx={{ fontSize: 14, color: "success.main" }}
                  />
                ) : (
                  <RadioButtonUncheckedIcon
                    sx={{ fontSize: 14, color: "text.disabled" }}
                  />
                )}

                <Typography
                  variant="caption"
                  color={condition.met ? "text.primary" : "text.secondary"}
                >
                  {condition.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* TRADE LEVELS */}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
          >
            TRADE SETUP
          </Typography>

          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Entry
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {formatValue(tf.entry?.optimalEntry)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="success.main">
                TP
              </Typography>
              <Typography variant="caption" color="success.main" fontWeight={700}>
                {formatValue(tf.entry?.optimalTP)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="error.main">
                SL
              </Typography>
              <Typography variant="caption" color="error.main" fontWeight={700}>
                {formatValue(tf.entry?.optimalSL)}
              </Typography>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Risk : Reward
              </Typography>
              <Typography
                variant="caption"
                color="success.main"
                fontWeight={800}
              >
                {formatValue(tf.entry?.rr)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}

export default function MarketState({ sendAlerts = false }) {
  const marketState = useSwingStore((s) => s.marketState);

  // Avoid sending Telegram messages during React rendering.
  useEffect(() => {
    if (sendAlerts && marketState) {
      sendTelegramMessage(marketState);
    }
  }, [sendAlerts, marketState]);

  if (!marketState || Object.keys(marketState).length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        No market analysis available.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {Object.entries(marketState).map(([market, timeframes]) => {
        const [exchange, marketType, symbol] = market.split("|");

        return (
          <Paper
            key={market}
            elevation={2}
            sx={{
              borderRadius: 2.5,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* MARKET HEADER */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: "action.hover",
              }}
            >
              <Stack spacing={0.3}>
                <Typography fontWeight={800} variant="subtitle1">
                  {symbol}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {exchange?.toUpperCase()} · {marketType?.toUpperCase()}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: "success.main",
                  }}
                />

                <Typography
                  variant="caption"
                  color="success.main"
                  fontWeight={700}
                >
                  LIVE
                </Typography>
              </Stack>
            </Stack>

            {/* TIMEFRAME ANALYSIS */}
            <Stack spacing={1} sx={{ p: 1.5 }}>
              {Object.entries(timeframes).map(([timeframe, data]) => (
                <TimeframeCard
                  key={timeframe}
                  timeframe={timeframe}
                  data={data}
                />
              ))}
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
