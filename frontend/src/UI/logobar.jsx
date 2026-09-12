import {
  AppBar,
  Toolbar,
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Popover,
  Tooltip
} from "@mui/material";

import ReplayIcon from "@mui/icons-material/Replay";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import FullscreenOutlinedIcon from "@mui/icons-material/FullscreenOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

import BidAskCathedralLogo from "./logo";
import { getCapabilities } from "../registry";
import ReplayButton from "../capabilities/replay/replayButton";

import LayoutControls from "./panelUtils/layoutControls";
import Journal from "../capabilities/journal/Journal";
import useMediaQuery from "@mui/material/useMediaQuery";
import FetchDataButton from "../capabilities/fetch";
import DevTools from "../capabilities/devTools";
import Trading from "../capabilities/trade";
import ochestrator from '../ochestrator/main';

import { useState } from "react";

function ManualUpload(){
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const id = open
    ? "upload-popover"
    : undefined;

  c
  
  return (
    <Box>
      <Tooltip><Button
        aria-describedby={id}
        onClick={handleClick}
        variant="outlined"

      >
        upload
        
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
        <input type="file" onChange={e=>{
          ochestrator.send("upload", {zip:e.target.files[0]}, "http")
        }}/>
        <Button onClick={handleClose} variant="contained">Fetch</Button>
      </Popover>
    </Box>
  )
}

export default function LogoBar() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const Journal = getCapabilities("journal")[0].component;
  //console.log(Journal)
  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      sx={{
      borderRadius: 2,
      overflow: "hidden",
    }}
    >
      <Toolbar
        variant="dense"
        sx={{
          minHeight: 34,
          height: 34,
          px: 1,
          gap: 2,
        }}
      >
        {/* Branding */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexShrink: 0 }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <BidAskCathedralLogo size={28} />
          </Box>

          <Typography
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: "1.35rem",
              color: "secondary.main",
              whiteSpace: "nowrap",
            }}
          >
            {isMobile ? null : "BidAsk Cathedral"}
          </Typography>
        </Stack>

        {/* ================================================= */}
        {/* Primary Capabilities */}
        {/* ================================================= */}

        <Stack
          direction="row"
            spacing={1}
            sx={{
              flex: 1,
              overflowX: "auto",
              overflowY: "hidden",
              whiteSpace: "nowrap",

              "&::-webkit-scrollbar": {
                height: 4,
              },
            }}
        >
          {/* */}
          
        </Stack>

        {/* ================================================= */}
        {/* Global Actions */}
        {/* ================================================= */}

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexShrink: 0 }}
        >
          {/*<Trading/>*/}
          <ManualUpload/>
          <FetchDataButton/>
          <Journal/>
          <ReplayButton/>
          <LayoutControls/>
          <DevTools/>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}