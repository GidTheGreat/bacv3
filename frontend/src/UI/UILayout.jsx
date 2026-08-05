// Layout.jsx
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import LogoBar from "./logobar";
import BottomBar from "./bottomBar";
import DrawingToolbar from "./drawings/drawingTools";
import Dock from "./dock";
import { getCapabilities } from "../registry";

export default function Layout() {
 const ChartManager = getCapabilities("chartManager")[0].component;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "grid",
        gridTemplateRows: "36px 1fr 28px",
        bgcolor: "background.default",
        gap: 1,
        p: 1,
      }}
    >
      <LogoBar />

      {/* ===========================================================
          WORKSPACE
      ============================================================ */}

      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflow: "hidden",
        }}
      >
        
        {/* =======================================================
            DRAWING TOOLS
        ======================================================== */}

        {//<DrawingToolbar />
}
        {/* =======================================================
            MAIN VIEW
        ======================================================== */}

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          

          <Paper
            sx={{
              flex: 1,
              display: "flex",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <ChartManager/>
            
          </Paper>
        </Box>

        {/* =======================================================
            CAPABILITY DOCK
        ======================================================== */}

        <Dock/>
      </Box>

      <BottomBar />
    </Box>
  );
}