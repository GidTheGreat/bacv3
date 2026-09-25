// Layout.jsx
import { Box, IconButton, Paper, Stack, Typography,Popover } from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import LogoBar from "./logobar";
import BottomBar from "./bottomBar";
import DrawingToolbar from "./drawings/drawingTools";
import { getCapabilities } from "../registry";
import PanelManager from "./panelManager";
import useTradeStore from "../stores/tradeStore";
import { useEffect } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

function gridStyle(tradeMode, isMobile) {
  if (!tradeMode) {
    return {
      gridTemplateColumns: "40px 1fr",
    };
  } else {
    if (isMobile) {
      return {
        gridTemplateColumns: "40px 1fr",
        gridTemplateRows: "1fr 100px",
      };
    } else {
      return {
        gridTemplateColumns: "40px 1fr 300px",
      };
    }
  }
}


export default function Layout() {
 const ChartManager = getCapabilities("chartManager")[0].component;
 const tradeMode = useTradeStore((state) => state.tradeMode);

 const isMobile = useMediaQuery('(max-width:600px)');
 console.log(isMobile);

 useEffect(() => {
        console.log("Trade mode changed:", tradeMode);
    console.log("gridstyle mid:", gridStyle(tradeMode));

    }, [tradeMode]);
 
  return (
    <Box
      sx={{
        height: "100dvh",
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
          display: "grid",
          ...gridStyle(tradeMode,isMobile),
          gap: 1,
          overflow: "hidden",
        }}
      >
        
        {/* =======================================================
            DRAWING TOOLS
        ======================================================== */}

        {<DrawingToolbar />
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
            width: "100%",
            height: "100%",
            
          }}
        >
          

          <Paper
            sx={{
              width: "100%",
              height: "100%",
            }}
          >
            {<PanelManager/>
            }
            
          </Paper>
        </Box>

        
      </Box>

      <BottomBar />
    </Box>
  );
}