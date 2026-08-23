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
  Radio
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
  useEffect(()=>{console.log(footPrintState)},[footPrintState])

  const handleChange = (property, event) => {
    setFootPrintState(chartId, property, event.target.value)
    
    //handleClose();
  };

  return (
    <Box sx={{ display: "inline-flex" }}>
      <IconButton
        size="small"
        aria-describedby={id}
        onClick={handleClick}
      >
        <CandlestickChartIcon />
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
      >
        <Box sx={{
              mt: 1,
              pt: 1,
              borderTop: "1px solid",
              borderColor: "divider",
            }}>
              <Typography>Display Value</Typography>
          <RadioGroup value={footPrintState?.notional ?? true} onChange={
            (event)=>handleChange("notional", event)}>
            <FormControlLabel
              value={true}
              control={<Radio />}
              label="Notional"
            />

            <FormControlLabel
              value={false}
              control={<Radio />}
              label="Quantity"
            />

          </RadioGroup>
        </Box>
        <Box sx={{
              mt: 1,
              pt: 1,
              borderTop: "1px solid",
              borderColor: "divider",
            }}>
          
            <Typography>FootPrint </Typography>
          <RadioGroup value={footPrintState?.fpStatus?? "full"} onChange={
            (event)=>handleChange("fpStatus", event)}>
            <FormControlLabel
              value="off"
              control={<Radio />}
              label="Off"
            />

            <FormControlLabel
              value="delta"
              control={<Radio />}
              label="Delta"
            />

            <FormControlLabel
              value="full"
              control={<Radio />}
              label="Full"
            />
          </RadioGroup>

          {footPrintState?.fpStatus === "full" && (
            <Box sx={{ mt: 1 }}>
              {/* VA % control */}
              {/* POC checkbox */}
              VALUE AREA
            </Box>
          )}

          <Box
            sx={{
              mt: 1,
              pt: 1,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
           {/*<Typography>Footer</Typography>
            <RadioGroup value={footPrintState?.footer ?? false} onChange={
            (event)=>handleChange("footer", event)}>
            <FormControlLabel
              value={true}
              control={<Radio />}
              label="Yes"
            />

            <FormControlLabel
              value={false}
              control={<Radio />}
              label="No"
            />

          </RadioGroup>*/}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}