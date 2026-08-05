import {
  Paper,
  Stack,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";

import MouseOutlinedIcon from "@mui/icons-material/MouseOutlined";
import PanToolAltOutlinedIcon from "@mui/icons-material/PanToolAltOutlined";

import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import HorizontalRuleOutlinedIcon from "@mui/icons-material/HorizontalRuleOutlined";
import HeightOutlinedIcon from "@mui/icons-material/HeightOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import PolylineOutlinedIcon from "@mui/icons-material/PolylineOutlined";

import RectangleOutlinedIcon from "@mui/icons-material/RectangleOutlined";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import TextFieldsOutlinedIcon from "@mui/icons-material/TextFieldsOutlined";

import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";

import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import GridOnOutlinedIcon from "@mui/icons-material/GridOnOutlined";

import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import RedoOutlinedIcon from "@mui/icons-material/RedoOutlined";

const groups = [
  [
    ["Cursor", <MouseOutlinedIcon />],
    ["Pan", <PanToolAltOutlinedIcon />],
  ],

  [
    ["Trend Line", <TimelineOutlinedIcon />],
    ["Horizontal Line", <HorizontalRuleOutlinedIcon />],
    ["Vertical Line", <HeightOutlinedIcon />],
    ["Ray", <ShowChartOutlinedIcon />],
    ["Polyline", <PolylineOutlinedIcon />],
  ],

  [
    ["Rectangle", <RectangleOutlinedIcon />],
    ["Circle", <CircleOutlinedIcon />],
  ],

  [
    ["Brush", <EditOutlinedIcon />],
    ["Text", <TextFieldsOutlinedIcon />],
  ],

  [
    ["Long Position", <TrendingUpOutlinedIcon />],
    ["Short Position", <TrendingDownOutlinedIcon />],
  ],

  [
    ["Measure", <StraightenOutlinedIcon />],
    ["Grid", <GridOnOutlinedIcon />],
  ],

  [
    ["Undo", <UndoOutlinedIcon />],
    ["Redo", <RedoOutlinedIcon />],
    ["Clear Drawings", <DeleteSweepOutlinedIcon />],
  ],
];

export default function DrawingToolbar() {
  return (
    <Paper
      sx={{
        py: 1,
        px: 0.5,
        display: "flex",
        justifyContent: "center",
        overflowY: "auto",
      }}
    >
      <Stack spacing={0.5}>
        {groups.map((group, i) => (
          <Stack
            key={i}
            spacing={0.5}
          >
            {group.map(([label, icon]) => (
              <Tooltip
                key={label}
                title={label}
                placement="right"
              >
                <IconButton size="small">
                  {icon}
                </IconButton>
              </Tooltip>
            ))}

            {i !== groups.length - 1 && <Divider />}
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}