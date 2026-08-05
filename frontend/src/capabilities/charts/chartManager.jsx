import { useEffect, useState } from "react";
import NewChart from "./nChart";
import useChartStore from "../../stores/chartStore";
import Buttons from "./buttons";
import {
  Box,
  Paper,
  Button,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

//import ReplayToggle from "./replay";
//import Alerts from "./Alerts";
//import FetchDataButton from "./fetch";



export default function ChartManager({ controls = Buttons }) {
  const createChart = useChartStore((s)=>s.createChart)
  const destroyChart = useChartStore((s)=>s.destroyChart)

  const dataset = useChartStore(state => state.data)
  const defaultSelection =
  useChartStore(s => s.selection.default);
  const theme = useTheme();

  const [replayOpen, setReplayOpen] = useState(false);   // panel visibility
  const [replayOwner, setReplayOwner] = useState(null);  // which pane owns the panel
  const [replayState, setReplayState] = useState({
      replayBar: false,
      streams: {}
  });

  

  const restoreStyle = {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #353b45",
    background: "#20252d",
    color: "#c9d1d9",
    cursor: "pointer",
  };

  const [nextId, setNextId] = useState(1);
  const [chartNames, setChartNames] = useState({
    default: "Chart",
  });

  const [editingChart, setEditingChart] = useState(null);

  const [layout, setLayout] = useState({
    left: {
      visible: true,
      active: "default",
      charts: ["default"],
    },
    right: {
      visible: false,
      active: null,
      charts: [],
    },
  });

  // -------------------------
  // Chart operations
  // -------------------------

  const addChart = (pane) => {
    const id = `chart${nextId}`;

    setNextId((n) => n + 1);

    createChart(id)

    setChartNames((prev) => ({
      ...prev,
      [id]: `Chart ${nextId}`,
    }));

    setLayout((prev) => ({
      ...prev,
      [pane]: {
        ...prev[pane],
        charts: [...prev[pane].charts, id],
        active: id,
      },
    }));
  };

  const removeChart = (pane, id) => {
    if (id === "default") return;
    destroyChart(id)

    setChartNames((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    setLayout((prev) => {
      const charts = prev[pane].charts.filter((c) => c !== id);
    
      return {
        ...prev,
        [pane]: {
          ...prev[pane],
          charts,
          active:
            prev[pane].active === id
              ? (charts[0] ?? null)
              : prev[pane].active,
        },
      };
    });
  };

  const switchChart = (pane, id) => {
    setLayout((prev) => ({
      ...prev,
      [pane]: {
        ...prev[pane],
        active: id,
      },
    }));
  };

  // -------------------------
  // Pane operations
  // -------------------------

  const removePane = (pane) => {
    setLayout((prev) => ({
      ...prev,
      [pane]: {
        ...prev[pane],
        visible: false,
      },
    }));
  };

  const restorePane = (pane) => {
    setLayout((prev) => ({
      ...prev,
      [pane]: {
        ...prev[pane],
        visible: true,
      },
    }));
  };

  // -------------------------
  // Rendering
  // -------------------------

  
  const renderPane = (name) => {
  const pane = layout[name];

  if (!pane.visible) return null;

  return (
    <Box
      key={name}
      sx={{
      flex: 1,
      display: "flex",
      flexDirection: "column",

      bgcolor: "background.default",
      border: 1,
      borderColor: "divider",

      overflow: "hidden",
      minWidth: 0,
    }}
    >
      {/* ---------- Toolbar ---------- */}

      <Box
          sx={{
            height: 42,
            display: "flex",

            bgcolor: "background.paper",

            borderBottom: 1,
            borderColor: "divider",
            borderRadius:7
        }}
                >
        <Box
          sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",

          gap: 1,
          px: 1,

          minWidth: 0,
        }}
          >
        <IconButton
          onClick={() => addChart(name)}
          title="New Chart"
          sx={{
            width: 28,
            height: 28,

            flexShrink: 0,

            borderRadius: 1,
            border: 1,
            borderColor: "divider",

            bgcolor: "background.paper",
            color: "text.primary",

            fontSize: 18,
        }}
        >
          +
        </IconButton>
        {/* ---------------- Tabs ---------------- */}

        <Box
          style={{
            flex: 1,
            display: "flex",
            gap: 4,
            overflowX: "auto",
            overflowY: "hidden",
            whiteSpace: "nowrap",
            scrollbarWidth: "thin",
            minWidth: 0,
          }}
        >
          {pane.charts.map((id) => {
            const active = pane.active === id;

            return (
              <Box
                key={id}
                sx={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  borderBottom: 2,

                  borderColor: active
                      ? "primary.main"
                      : "transparent",
                }}
              >
                {editingChart === id ? (
                  <TextField
                    autoFocus
                    defaultValue={chartNames[id] ?? id}
                    onBlur={(e) => {
                      const value = e.target.value.trim();

                      setChartNames((prev) => ({
                        ...prev,
                        [id]: value || prev[id],
                      }));

                      setEditingChart(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.target.blur();

                      if (e.key === "Escape")
                        setEditingChart(null);
                    }}
                    sx={{
                      width: 100,

                      "& .MuiOutlinedInput-root": {
                        bgcolor: "background.paper",
                        color: "text.primary",
                        borderRadius: 1,

                        "& fieldset": {
                          borderColor: "primary.main",
                        },

                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },

                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                ) : (
                  <IconButton
                    onClick={() => switchChart(name, id)}
                    onDoubleClick={() => setEditingChart(id)}
                    sx={{
                      bgcolor: "transparent",
                      color: active ? "primary.main" : "text.primary",
                      px: 1.25,
                      height: 30,
                      whiteSpace: "nowrap",
                      borderRadius: 1,

                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    {chartNames[id] ?? id}
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Box>

        {/* ---------------- Right Tools ---------------- */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            minWidth: 0,
            maxWidth: "50%",
            overflow: "hidden",
          }}
        >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            overflowX: "auto",
            overflowY: "hidden",
            whiteSpace: "nowrap",
            scrollbarWidth: "thin",
            WebkitOverflowScrolling: "touch",
            pb: 0.25,
          }}
        >
            {/*<Alerts/>
              <ReplayToggle
                  ctx={{
                      replayState,
                      setReplayState,
                      dataset,
                      defaultSelection,
                      replayOpen,
                       setReplayOpen,
                       replayOwner, 
                       setReplayOwner,
                       name
                  }}
              />

              <FetchDataButton /> */}
              
        </Box>

        <Box
          sx={{
          width: 60,
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderLeft: 1,
          borderColor: "divider",
        }}
        >
          {layout.left.visible && layout.right.visible && (
            <IconButton
              onClick={() => removePane(name)}
              title="Collapse Pane"
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                color: "text.primary",
                fontSize: 10,

                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              {name === "left" ? "◧" : "◨"}
            </IconButton>
          )}
        </Box>

              
            </Box>
          </Box>
      </Box>

      {/* ---------------- Chart ---------------- */}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
        }}
      >
        
        {pane.active && (
          <NewChart
            key={pane.active}
            chartId={pane.active}
            Controls={controls}
            replayState={replayState}
            setReplayState={setReplayState}
            destroy={
              pane.active === "default"
                ? null
                : () => removeChart(name, pane.active)
            }
          />
        )}
      </Box>
    </Box>
  );
};

  return (
  <Box
    sx={{
      position: "relative",
      display: "flex",
      width: "100%",
      height: "100%",
    }}
  >
    {/* Floating Restore Buttons */}

    {!layout.left.visible && (
      <IconButton
        title="Restore Left Pane"
        onClick={() => restorePane("left")}
        sx={{
          position: "absolute",
          top: 1,
          left: 1,
          zIndex: 50,
          width: 34,
          height: 34,
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          color: "text.primary",

          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
              >
        ◧
      </IconButton>
    )}

    {!layout.right.visible && (
      <IconButton
        title="Restore Right Pane"
        onClick={() => restorePane("right")}
        sx={{
          position: "absolute",
          top: 1,
          right: 1,
          zIndex: 50,
          width: 34,
          height: 34,
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          color: "text.primary",

          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
      >
        ◨
      </IconButton>
    )}

    {renderPane("left")}
    {renderPane("right")}
  </Box>
);
}