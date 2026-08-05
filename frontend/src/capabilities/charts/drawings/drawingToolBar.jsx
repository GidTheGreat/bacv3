import {
  Box,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";

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
    { id: "cursor", icon: MousePointer2, label: "Cursor" },
    { id: "trendline", icon: Slash, label: "Trend" },
    { id: "horizontal", icon: Minus, label: "Horizontal" },
    { id: "vertical", icon: ArrowUpDown, label: "Vertical" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "ray", icon: Pencil, label: "Ray" },
    { id: "text", icon: Type, label: "Text" },
    { id: "measure", icon: Move, label: "Measure" },
    { id: "long", icon: TrendingUp, label: "Long" },
    { id: "short", icon: TrendingDown, label: "Short" },
  ];

  const visibleTools = toolIds
    ? tools.filter((tool) => toolIds.includes(tool.id))
    : tools;

  const buttonSx = (active) => ({
    width: 34,
    height: 34,
    borderRadius: "7px",
    border: active
      ? "1px solid #3b82f6"
      : "1px solid #353b45",
    bgcolor: active ? "#243244" : "#20252d",
    color: active ? "#58a6ff" : "#c9d1d9",
    flexShrink: 0,
    "&:hover": {
      bgcolor: active ? "#243244" : "#2b313b",
    },
  });

  const dangerSx = {
    width: 34,
    height: 34,
    borderRadius: "7px",
    border: "1px solid #5b2c2c",
    bgcolor: "#2a2020",
    color: "#ff7b72",
    flexShrink: 0,
    "&:hover": {
      bgcolor: "#342626",
    },
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 12,
        left: 12,

        display: "flex",
        flexDirection: "column",
        gap: "5px",

        width: 34,
        maxHeight: "calc(100% - 24px)",

        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",

        bgcolor: "transparent",

        zIndex: 1000,
        userSelect: "none",

        scrollbarWidth: "thin",
        scrollbarColor: "#5a6472 transparent",
      }}
    >
      {visibleTools.map((tool) => {
        const Icon = tool.icon;

        return (
          <Tooltip
            key={tool.id}
            title={tool.label}
            placement="right"
            arrow
            enterTouchDelay={0}
            leaveTouchDelay={1500}
          >
            <IconButton
              size="small"
              sx={buttonSx(activeTool === tool.id)}
              onClick={() =>
                onSelectTool(
                  activeTool === tool.id
                    ? null
                    : tool.id
                )
              }
            >
              <Icon size={18} />
            </IconButton>
          </Tooltip>
        );
      })}

      <Divider
        sx={{
          width: 24,
          alignSelf: "center",
          borderColor: "#404754",
          my: "4px",
        }}
      />

      <Tooltip
        title="Delete Selected"
        placement="right"
        arrow
        enterTouchDelay={0}
        leaveTouchDelay={1500}
      >
        <IconButton
          size="small"
          sx={dangerSx}
          onClick={onDeleteSelected}
        >
          <Trash2 size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip
        title="Delete All"
        placement="right"
        arrow
        enterTouchDelay={0}
        leaveTouchDelay={1500}
      >
        <IconButton
          size="small"
          sx={dangerSx}
          onClick={onDeleteAll}
        >
          <Trash size={18} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}