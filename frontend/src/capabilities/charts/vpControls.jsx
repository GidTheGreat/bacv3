import {
  Box,
  Paper,
  Button,
  IconButton,
  TextField,
  Typography,
  ToggleButton,
  Popover,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox
} from "@mui/material";
import CandlestickChartIcon from "@mui/icons-material/CandlestickChart";
import useFootprintStore from "../../stores/footPrintStore";
import { useState, useEffect} from "react"

export default function VPControls({ chartId }) {
  const footPrintState = useFootprintStore(
    (s) => s.footPrintState?.[chartId]
  );

  const setFootPrintState = useFootprintStore(
    (s) => s.setFootPrintState
  );

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "footprint-popover" : undefined;

  const enabled = footPrintState?.footprint ?? false;

  const toggle = (key) => {
    setFootPrintState(
      chartId,
      key,
      !footPrintState?.[key]
    );
  };

  const controlSx = {
    m: 0,
    width: "100%",
    minHeight: 30,
    justifyContent: "space-between",

    "& .MuiFormControlLabel-label": {
      fontSize: 12,
    },

    "& .MuiCheckbox-root": {
      p: 0.5,
    },
  };

  return (
    <Box sx={{ display: "inline-flex" }}>
      <IconButton
        size="small"
        aria-describedby={id}
        onClick={handleClick}
        sx={{
          borderRadius: 1,
          bgcolor: enabled
            ? "rgba(120, 90, 255, 0.18)"
            : "transparent",

          color: enabled
            ? "primary.light"
            : "text.secondary",

          "&:hover": {
            bgcolor: "rgba(120, 90, 255, 0.12)",
          },
        }}
      >
        <CandlestickChartIcon fontSize="small" />
      </IconButton>

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
              mt: 0.5,
              width: 210,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              boxShadow: 8,
              overflow: "hidden",
            },
          },
        }}
      >
        <Box sx={{ p: 1.25 }}>

          {/* Header */}

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 0.75,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              color: "text.secondary",
            }}
          >
            FOOTPRINT
          </Typography>


          {/* Master */}

          <Box
            sx={{
              px: 0.75,
              py: 0.25,
              mb: 0.75,

              borderRadius: 1,

              bgcolor: enabled
                ? "rgba(120, 90, 255, 0.10)"
                : "transparent",
            }}
          >
            <FormControlLabel
              sx={{
                ...controlSx,

                "& .MuiFormControlLabel-label": {
                  fontSize: 12,
                  fontWeight: 600,
                },
              }}
              labelPlacement="start"
              checked={enabled}
              control={
                <Checkbox
                  size="small"
                  onChange={() => toggle("footprint")}
                />
              }
              label="Enable Footprint"
            />
          </Box>


          {/* Divider */}

          <Box
            sx={{
              height: 1,
              bgcolor: "divider",
              mb: 0.5,
            }}
          />


          {/* Options */}

          <Box
            sx={{
              opacity: enabled ? 1 : 0.35,
              transition: "opacity 150ms ease",
            }}
          >

            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.5,
                mb: 0.25,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 0.8,
                color: "text.secondary",
              }}
            >
              DISPLAY
            </Typography>


            <FormControlLabel
              sx={controlSx}
              labelPlacement="start"
              checked={footPrintState?.notional ?? true}
              control={
                <Checkbox
                  size="small"
                  disabled={!enabled}
                  onChange={() => toggle("notional")}
                />
              }
              label="Notional"
            />


            <FormControlLabel
              sx={controlSx}
              labelPlacement="start"
              checked={footPrintState?.lod ?? false}
              control={
                <Checkbox
                  size="small"
                  disabled={!enabled}
                  onChange={() => toggle("lod")}
                />
              }
              label="Variable LOD"
            />


            <Box
              sx={{
                height: 1,
                bgcolor: "divider",
                my: 0.5,
              }}
            />


            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 0.25,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 0.8,
                color: "text.secondary",
              }}
            >
              LEVELS
            </Typography>


            <FormControlLabel
              sx={controlSx}
              labelPlacement="start"
              checked={footPrintState?.poc ?? false}
              control={
                <Checkbox
                  size="small"
                  disabled={!enabled}
                  onChange={() => toggle("poc")}
                />
              }
              label="Point of Control"
            />


            <FormControlLabel
              sx={controlSx}
              labelPlacement="start"
              checked={footPrintState?.ua ?? false}
              control={
                <Checkbox
                  size="small"
                  disabled={!enabled}
                  onChange={() => toggle("ua")}
                />
              }
              label="Unfinished Auction"
            />


            <Box
              sx={{
                height: 1,
                bgcolor: "divider",
                my: 0.5,
              }}
            />


            <FormControlLabel
              sx={controlSx}
              labelPlacement="start"
              checked={footPrintState?.footer ?? false}
              control={
                <Checkbox
                  size="small"
                  disabled={!enabled}
                  onChange={() => toggle("footer")}
                />
              }
              label="Footer"
            />

          </Box>

        </Box>
      </Popover>
    </Box>
  );
}