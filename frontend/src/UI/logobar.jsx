import {
  AppBar,
  Toolbar,
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
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

export default function LogoBar() {
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
          alignItems="center"
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
            BidAsk Cathedral
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
          <Button startIcon={<ReplayIcon />}>
            Replay
          </Button>

          <Journal/>

          <Button startIcon={<NotificationsNoneOutlinedIcon />}>
            Alerts
          </Button>

          <Button startIcon={<AccountTreeOutlinedIcon />}>
            Strategy
          </Button>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            endIcon={<KeyboardArrowDownIcon />}
          >
            Add Panel
          </Button>
        </Stack>

        {/* ================================================= */}
        {/* Global Actions */}
        {/* ================================================= */}

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexShrink: 0 }}
        >
          <IconButton>
            <SettingsOutlinedIcon />
          </IconButton>

          <IconButton>
            <FullscreenOutlinedIcon />
          </IconButton>

          <IconButton>
            <DashboardCustomizeOutlinedIcon />
          </IconButton>

          <IconButton>
            <AccountCircleOutlinedIcon />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}