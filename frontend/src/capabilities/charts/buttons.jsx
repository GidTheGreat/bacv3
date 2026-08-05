
import { useState } from "react";
import { Settings, X } from "lucide-react";
import { createPortal } from "react-dom";

import useChartStore from "../../stores/chartStore";
import {
  Box,
  Paper,
  Button,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function Buttons({ chartId }) {
    const theme = useTheme();
  const selection = useChartStore((s) => s.selection[chartId]);
  const modifySelection = useChartStore((s) => s.modifySelection);
  const symbols = useChartStore((s) => s.symbols);
  const timeframes = useChartStore((s) => s.timeframes);
  const platforms = useChartStore((s) => s.platforms);
  const trade_types = useChartStore((s) => s.trade_types);
  const candle_types = useChartStore((s) => s.candle_types);

  const [open, setOpen] = useState(false);

  const selectStyle = {
    height: 25,
    width: "100%",
    padding: "0 36px 0 12px",
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    outline: "none",
    fontSize: 14,
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
  };

  const labelStyle = {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      color: theme.palette.text.secondary,
      fontSize: 3,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: ".08em",
    };

  const Row = ({ label, value, values, field }) => (
    <Box sx={labelStyle}>
      <Typography>{label}</Typography>
      <select
        style={selectStyle}
        value={value}
        onChange={(e) =>
          modifySelection(chartId, { [field]: e.target.value })
        }
      >
        {values.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </Box>
  );

  return (
    <>
      {/* Compact toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            color: "text.primary",
            fontSize: 13,
            px: 1.25,
            py: 0.75,
            borderRadius: 1,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            whiteSpace: "nowrap",
          }}
        >
          <strong>{selection.symbol}</strong> · {selection.timeframe}
        </Box>

        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.primary",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <Settings size={18} />
        </IconButton>
      </Box>

      {/* Bottom Sheet */}
      {open &&
        createPortal(
          <>
            {/* Backdrop */}
            <Box
              onClick={() => setOpen(false)}
              sx={{
                position: "fixed",
                inset: 0,
                bgcolor: "rgba(0,0,0,.45)",
                zIndex: 9998,
              }}
            />

            {/* Sheet */}
            <Box
              sx={{
                position: "fixed",
                left: "50%",
                bottom: 16,
                transform: "translateX(-50%)",

                width: "min(420px, calc(100vw - 32px))",

                bgcolor: "background.default",
                borderRadius: 2,
                border: 1,
                borderColor: "divider",

                p: 1,
                gap: 1,

                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                boxShadow: 24,
              }}
            >
              {/* Grab handle */}
              <Box
                sx={{
                  width: 42,
                  height: 4,
                  borderRadius: 999,
                  bgcolor: "divider",
                  alignSelf: "center",
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                  color: "text.primary",
                  fontSize: 16,
                  fontWeight: 600,
                }}
                >
                  Market Settings
                </Box>

                <IconButton
                  onClick={() => setOpen(false)}
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "transparent",
                    color: "text.primary",

                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <X size={20} />
                </IconButton>
              </Box>

              <Row
                label="Symbol"
                value={selection.symbol}
                values={symbols}
                field="symbol"
              />

              <Row
                label="Timeframe"
                value={selection.timeframe}
                values={timeframes}
                field="timeframe"
              />

              <Row
                label="Exchange"
                value={selection.platform}
                values={platforms}
                field="platform"
              />

              <Row
                label="Market"
                value={selection.trade}
                values={trade_types}
                field="trade"
              />

              <Row
                label="Candle"
                value={selection.candle}
                values={candle_types}
                field="candle"
              />
            </Box>
          </>,
          document.body
        )}
    </>
  );
}