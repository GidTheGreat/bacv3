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
  const footPrintState = useFootprintStore((s) => s.footPrintState?.[chartId]);
  const setFootPrintState = useFootprintStore((s) => s.setFootPrintState);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "footprint-popover" : undefined;
  //useEffect(()=>{console.log(footPrintState)},[footPrintState])


  return (
    <Box sx={{ display: "inline-flex" }}>
      <IconButton
        size="small"
        aria-describedby={id}
        onClick={handleClick}
        sx={{
          borderRadius: 1,
          bgcolor: footPrintState?.footprint
            ? "rgba(120, 90, 255, 0.18)"
            : "transparent",
          color: footPrintState?.footprint
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
                mt: 0.75,
                minWidth: 190,
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
          <Box sx={{ px: 1.5, py: 1.25 }}>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 1,
                color: "text.secondary",
                fontWeight: 600,
                letterSpacing: 0.8,
              }}
            >
              FOOTPRINT
            </Typography>

            <Box
              sx={{
                height: 1,
                bgcolor: "divider",
                mb: 0.75,
              }}
            />

            <FormControlLabel
              sx={{
                m: 0,
                width: "100%",
                justifyContent: "space-between",

                "& .MuiFormControlLabel-label": {
                  fontSize: 13,
                  fontWeight: 500,
                },
              }}
              labelPlacement="start"
              checked={footPrintState?.footprint ?? false}
              control={
                <Checkbox
                  size="small"
                  onChange={() =>
                    setFootPrintState(
                      chartId,
                      "footprint",
                      !footPrintState?.footprint
                    )
                  }
                />
              }
              label="Enable Footprint"
            />

            <Box
              sx={{
                ml: 1,
                mt: 0.5,
                pl: 1.25,
                borderLeft: "1px solid",
                borderColor: "divider",
                opacity: footPrintState?.footprint ? 1 : 0.4,
                transition: "opacity 150ms ease",
              }}
            >
              <FormControlLabel
                sx={{
                  m: 0,
                  width: "100%",
                  justifyContent: "space-between",

                  "& .MuiFormControlLabel-label": {
                    fontSize: 12,
                  },
                }}
                labelPlacement="start"
                checked={footPrintState?.lod ?? false}
                control={
                  <Checkbox
                    size="small"
                    disabled={!footPrintState?.footprint}
                    onChange={() =>
                      setFootPrintState(
                        chartId,
                        "lod",
                        !footPrintState?.lod
                      )
                    }
                  />
                }
                label="Variable Level of Detail"
              />
              
              <FormControlLabel
                sx={{
                  m: 0,
                  width: "100%",
                  justifyContent: "space-between",

                  "& .MuiFormControlLabel-label": {
                    fontSize: 12,
                  },
                }}
                labelPlacement="start"
                checked={footPrintState?.footer ?? false}
                control={
                  <Checkbox
                    size="small"
                    disabled={!footPrintState?.footprint}
                    onChange={() =>
                      setFootPrintState(
                        chartId,
                        "footer",
                        !footPrintState?.footer
                      )
                    }
                  />
                }
                label="Footer"
              />

              <FormControlLabel
                sx={{
                  m: 0,
                  width: "100%",
                  justifyContent: "space-between",

                  "& .MuiFormControlLabel-label": {
                    fontSize: 12,
                  },
                }}
                labelPlacement="start"
                checked={footPrintState?.poc ?? false}
                control={
                  <Checkbox
                    size="small"
                    disabled={!footPrintState?.footprint}
                    onChange={() =>
                      setFootPrintState(
                        chartId,
                        "poc",
                        !footPrintState?.poc
                      )
                    }
                  />
                }
                label="Point of Control"
              />
            </Box>

          </Box>
        </Popover>
    </Box>
  );
}