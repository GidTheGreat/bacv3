import { useEffect, useState } from "react";
import NewChart from "./nChart";
import useChartStore from "../../stores/chartStore";
//import ReplayToggle from "./replay";
//import Alerts from "./Alerts";
//import FetchDataButton from "./fetch";



export default function ChartManager({ controls = null }) {
  const createChart = useChartStore((s)=>s.createChart)
  const destroyChart = useChartStore((s)=>s.destroyChart)

  const dataset = useChartStore(state => state.data)
  const defaultSelection =
  useChartStore(s => s.selection.default);

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
    <div
      key={name}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#0b0b0b",
        border: "1px solid #2a2e39",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* ---------- Toolbar ---------- */}

      <div
          style={{
            height: 42,
            display: "flex",
            background: "#161b22",
            borderBottom: "1px solid #2a2e39",
          }}
        >
        <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 8px",
          minWidth: 0,
        }}
      >
        <button
          onClick={() => addChart(name)}
          title="New Chart"
          style={{
            width: 28,
            height: 28,
            flexShrink: 0,
            borderRadius: 6,
            border: "1px solid #353b45",
            background: "#20252d",
            color: "#c9d1d9",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          +
        </button>
        {/* ---------------- Tabs ---------------- */}

        <div
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
              <div
                key={id}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  borderBottom: active
                    ? "2px solid #2962ff"
                    : "2px solid transparent",
                }}
              >
                {editingChart === id ? (
                  <input
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
                    style={{
                      width: 100,
                      background: "#1b1f27",
                      color: "#fff",
                      border: "1px solid #2962ff",
                      borderRadius: 4,
                      outline: "none",
                      padding: "2px 6px",
                    }}
                  />
                ) : (
                  <button
                    onClick={() => switchChart(name, id)}
                    onDoubleClick={() => setEditingChart(id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: active ? "#4f8cff" : "#c9d1d9",
                      padding: "0 10px",
                      height: 30,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {chartNames[id] ?? id}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ---------------- Right Tools ---------------- */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            minWidth: 0,
            maxWidth: "50%",
            overflow: "hidden",
          }}
        >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            overflowX: "auto",
            overflowY: "hidden",
            whiteSpace: "nowrap",
            scrollbarWidth: "thin",
            WebkitOverflowScrolling: "touch",
            paddingBottom: 2,
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
              
        </div>

        <div
          style={{
            width: 60,
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderLeft: "1px solid #2a2e39",
          }}
        >
          {layout.left.visible && layout.right.visible && (
            <button
              onClick={() => removePane(name)}
              title="Collapse Pane"
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                border: "1px solid #353b45",
                background: "#20252d",
                color: "#c9d1d9",
                cursor: "pointer",
                fontSize: 10,
              }}
            >
              {name === "left" ? "◧" : "◨"}
            </button>
          )}
        </div>

              
            </div>
          </div>
      </div>

      {/* ---------------- Chart ---------------- */}

      <div
        style={{
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
      </div>
    </div>
  );
};

  return (
  <div
    style={{
      position: "relative",
      display: "flex",
      width: "100%",
      height: "100%",
    }}
  >
    {/* Floating Restore Buttons */}

    {!layout.left.visible && (
      <button
        title="Restore Left Pane"
        onClick={() => restorePane("left")}
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 50,
          width: 34,
          height: 34,
          borderRadius: 8,
          border: "1px solid #353b45",
          background: "#20252d",
          color: "#c9d1d9",
          cursor: "pointer",
        }}
      >
        ◧
      </button>
    )}

    {!layout.right.visible && (
      <button
        title="Restore Right Pane"
        onClick={() => restorePane("right")}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 50,
          width: 34,
          height: 34,
          borderRadius: 8,
          border: "1px solid #353b45",
          background: "#20252d",
          color: "#c9d1d9",
          cursor: "pointer",
        }}
      >
        ◨
      </button>
    )}

    {renderPane("left")}
    {renderPane("right")}
  </div>
);
}