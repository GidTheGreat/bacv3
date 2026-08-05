import { Box, Paper, Typography, IconButton } from "@mui/material";
import { useDockStore } from "../../../stores/dockstore";
import { getCapabilities } from "../../../registry";

import CloseIcon from "@mui/icons-material/Close";



export default function Dock() {
  const dock = useDockStore((s) => s.dock);

  const setActivePanel = useDockStore(
    (s) => s.setActivePanel
  );

  const removeDockPanel = useDockStore(
    (s) => s.removeDockPanel
  );

  const activePanel = dock.panels.find(
    (p) => p.id === dock.active
  );
  console.log(activePanel)

  const Capability = activePanel
    ? getCapabilities(activePanel.id)[0].component
    : null;

  return (
    <Paper
      elevation={3}
      sx={{
        width: 320,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderLeft: 1,
        borderColor: "divider",
      }}
    >
      {/* ---------- Tabs ---------- */}

      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {dock.panels.map((panel) => (
          <Box
            key={panel.id}
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1,
              py: 0.5,
              cursor: "pointer",
              bgcolor:
                dock.active === panel.id
                  ? "action.selected"
                  : "transparent",
            }}
            onClick={() => setActivePanel(panel.id)}
          >
            <Typography
              variant="body2"
              sx={{ mr: 1 }}
            >
              {panel.title}
            </Typography>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                removeDockPanel(panel.id);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Box>
        ))}
      </Box>

      {/* ---------- Active Capability ---------- */}

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
        }}
      >
        {Capability && <Capability />}
      </Box>
    </Paper>
  );
}