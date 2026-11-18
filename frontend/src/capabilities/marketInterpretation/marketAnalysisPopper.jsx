
import React, { useState } from "react";
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
  Stack,
  Typography,
  IconButton
} from "@mui/material";

import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h"];

export default function MarketAnalysisPopper() {
  const [anchorEl, setAnchorEl] = useState(null);

  const [showSwings, setShowSwings] = useState(true);
  const [timeframes, setTimeframes] = useState([
    "5m",
    "15m",
    "1h",
    "4h",
  ]);
  const [sendAlerts, setSendAlerts] = useState(false);

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  const togglePopper = (event) => {
    setAnchorEl(open ? null : event.currentTarget);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const toggleTimeframe = (timeframe) => {
    setTimeframes((prev) =>
      prev.includes(timeframe)
        ? prev.filter((item) => item !== timeframe)
        : [...prev, timeframe]
    );
  };

  const runAnalysis = () => {
    setLoading(true);
    setAnalysis(null);

    // Dummy analysis response
    setTimeout(() => {
      setAnalysis({
        trend: "Bullish",
        structure: "Higher High / Higher Low",
        lastSwing: "Higher High",
        support: "1.08250",
        resistance: "1.08950",
        summary:
          "Market structure currently indicates bullish momentum. Price has maintained a sequence of higher highs and higher lows.",
        signals: [
          "Bullish market structure confirmed on 15m",
          "Potential liquidity resting above recent highs",
          "1h structure remains bullish",
        ],
      });

      setLoading(false);
    }, 1000);
  };

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
        <ClickAwayListener onClickAway={handleClickAway}>
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

            {/* SECTION 1: MARKET STRUCTURE */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ mb: 1 }}
              >
                1. Market Structure
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={showSwings}
                    onChange={(e) => setShowSwings(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    Show swings
                  </Typography>
                }
              />
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
              onClick={runAnalysis}
              disabled={loading || timeframes.length === 0}
            >
              {loading ? "Analyzing..." : "Run Analysis"}
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
                {!analysis && !loading && (
                  <Typography variant="body2" color="text.secondary">
                    Configure your analysis and click Run Analysis to view results.
                  </Typography>
                )}

                {loading && (
                  <Typography variant="body2" color="text.secondary">
                    Processing market structure...
                  </Typography>
                )}

                {analysis && (
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Market Trend
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="success.main"
                      >
                        {analysis.trend}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Structure
                      </Typography>
                      <Typography variant="body2">
                        {analysis.structure}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Last Swing
                      </Typography>
                      <Typography variant="body2">
                        {analysis.lastSwing}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Support
                        </Typography>
                        <Typography variant="body2">
                          {analysis.support}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Resistance
                        </Typography>
                        <Typography variant="body2">
                          {analysis.resistance}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    <Typography variant="body2">
                      {analysis.summary}
                    </Typography>

                    <Typography variant="caption" fontWeight={700}>
                      Observations
                    </Typography>

                    {analysis.signals.map((signal, index) => (
                      <Typography
                        key={index}
                        variant="body2"
                        color="text.secondary"
                      >
                        • {signal}
                      </Typography>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Box>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
