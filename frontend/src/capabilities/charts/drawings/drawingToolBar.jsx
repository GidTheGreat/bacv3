// DrawingToolbar.jsx
// Stateless toolbar ready for integration.
// Props:
//   activeTool        -> string | null
//   onSelectTool      -> (tool) => void
//   onDeleteSelected  -> () => void
//   onDeleteAll       -> () => void

import {
  MousePointer2,
  Slash,
  Minus,
  ArrowUpDown,
  Square,
  Pencil,
  Type,
  Move,
  TrendingUp,
  TrendingDown,
  Trash2,
  Trash,
} from "lucide-react";

export default function DrawingToolbar({
  activeTool = null,
  onSelectTool = () => {},
  onDeleteSelected = () => {},
  onDeleteAll = () => {},
  toolIds = null,
}) {
  const tools = [
    {
      id: "cursor",
      icon: MousePointer2,
      label: "Cursor",
    },
    {
      id: "trendline",
      icon: Slash,
      label: "Trend",
    },
    {
      id: "horizontal",
      icon: Minus,
      label: "Horizontal",
    },
    {
      id: "vertical",
      icon: ArrowUpDown,
      label: "Vertical",
    },
    {
      id: "rectangle",
      icon: Square,
      label: "Rectangle",
    },
    {
      id: "ray",
      icon: Pencil,
      label: "Ray",
    },
    {
      id: "text",
      icon: Type,
      label: "Text",
    },
    {
      id: "measure",
      icon: Move,
      label: "Measure",
    },
    {
      id: "long",
      icon: TrendingUp,
      label: "Long",
    },
    {
      id: "short",
      icon: TrendingDown,
      label: "Short",
    },
  ];

  const visibleTools = toolIds
    ? tools.filter(tool => toolIds.includes(tool.id))
    : tools;

  const buttonStyle = (active) => ({
  width: 34,
  height: 34,
  borderRadius: 7,
  border: active
    ? "1px solid #3b82f6"
    : "1px solid #353b45",
  background: active ? "#243244" : "#20252d",
  color: active ? "#58a6ff" : "#c9d1d9",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  transition: "0.15s",
  flexShrink: 0,
});

const dangerStyle = {
  width: 34,
  height: 34,
  borderRadius: 7,
  border: "1px solid #5b2c2c",
  background: "#2a2020",
  color: "#ff7b72",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  flexShrink: 0,
};

  

  return (
  <div
    className="drawing-toolbar"
    style={{
      position: "absolute",
      top: 12,
      left: 12,

      display: "flex",
      flexDirection: "column",
      gap: 5,

      padding: 0,

      width: 34,

      maxHeight: "calc(100% - 24px)",
      overflowY: "visible",

      background: "transparent",
      border: "none",

      zIndex: 1000,
      userSelect: "none",

      scrollbarWidth: "thin",
      scrollbarColor: "#5a6472 transparent",
    }}
  >
    {visibleTools.map((tool) => {
      const Icon = tool.icon;

      return (
        <div
          key={tool.id}
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            style={buttonStyle(activeTool === tool.id)}
            onClick={() =>
              onSelectTool(
                activeTool === tool.id ? null : tool.id
              )
            }
            className="drawing-tool-btn"
          >
            <Icon size={18} />
          </button>

          <div className="drawing-tooltip">
            {tool.label}
          </div>
        </div>
      );
    })}

    <div
      style={{
        height: 1,
        width: 24,
        alignSelf: "center",
        background: "#404754",
        margin: "4px 0",
      }}
    />

    <div style={{ position: "relative" }}>
      <button
        style={dangerStyle}
        onClick={onDeleteSelected}
        className="drawing-tool-btn"
      >
        <Trash2 size={18} />
      </button>

      <div className="drawing-tooltip">
        Delete Selected
      </div>
    </div>

    <div style={{ position: "relative" }}>
      <button
        style={dangerStyle}
        onClick={onDeleteAll}
        className="drawing-tool-btn"
      >
        <Trash size={18} />
      </button>

      <div className="drawing-tooltip">
        Delete All
      </div>
    </div>
  </div>
);
}