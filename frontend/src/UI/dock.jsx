import { useState } from "react";
import {
  Box,
  IconButton,
  Paper
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { useDockStore } from "../stores/dockstore";
import { getCapabilities } from "../registry";



export default function Dock() {
    //console.count("Dock render");
    const dock = useDockStore((s) => s.dock);
    const openDock = useDockStore((s) => s.openDock);
    const closeDock = useDockStore((s) => s.closeDock);
    const panels = useDockStore(s=> s.panels)
  


  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        width: dock.open ? 320 : 40,
      }}
    >
      {dock.open ? (
        <Paper
          elevation={3}
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              p: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={() => {closeDock()}}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflow: "auto",
            }}
          >
           {panels?.map((panel) => {
            const Capability = getCapabilities(panel).component;

            return (
                <React.Fragment key={panel}>
                <Box component="header">panel</Box>
                <Capability />
                </React.Fragment>
            );
            })}
          </Box>
        </Paper>
      ) : (
        <IconButton
          onClick={() => {openDock()}}
          sx={{
            width: 40,
            height: 40,
          }}
        >
          <OpenInFullIcon />
        </IconButton>
      )}
    </Box>
  );
}