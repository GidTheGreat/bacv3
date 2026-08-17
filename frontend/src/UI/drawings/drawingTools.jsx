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
import useDrawingStore from "../../stores/drawingStore";
import useChartStore from "../../stores/chartStore";
import AdsClickIcon from '@mui/icons-material/AdsClick';

const groups = [
  [
    ["Cursor", <MouseOutlinedIcon />],
    ["Select Drawing", <AdsClickIcon/>]
  ],

  [
    ["Trend Line", <TimelineOutlinedIcon />],
    ["Horizontal Line", <HorizontalRuleOutlinedIcon />],
    ["Vertical Line", <HeightOutlinedIcon />],
    
  ],

  [
    ["Rectangle", <RectangleOutlinedIcon />],
    ["Circle", <CircleOutlinedIcon />],
  ],

  [
    
    ["Text", <TextFieldsOutlinedIcon />],
  ],

  [
    ["Long Position", <TrendingUpOutlinedIcon />],
    ["Short Position", <TrendingDownOutlinedIcon />],
  ],

  [
    ["Measure", <StraightenOutlinedIcon />],
    
  ],

  [
    
    ["Clear Drawings", <DeleteSweepOutlinedIcon />],
  ],
];

export default function DrawingToolbar() {
  const setDrawingState = useDrawingStore(s=>s.setDrawingState);
  const DrawingState = useDrawingStore(s=>s.DrawingState);
  const selections = useChartStore(s=>s.selection)

  //console.log(DrawingState)
  function handleDrawingstate(label){
    Object.keys(selections).forEach(chartId=>{
      if (!chartId.toLowerCase().endsWith("default")){
        const k1 = `${selections[chartId].platform}|${selections[chartId].trade}|${selections[chartId].symbol}`
        setDrawingState(k1, label)
        
      }
    })

  }
  return (
    <Paper
      sx={{
        py: 1,
        px: 0.5,
        display: "flex",
        justifyContent: "center",
        overflowY: "auto",
        overflowx:"hidden",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.2) transparent",

        "&::-webkit-scrollbar": {
            height: "4px",
        },
        "&::-webkit-scrollbar-track": {
            background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.2)",
            borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(255,255,255,0.4)",
        },
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
                <IconButton size="small"
                sx={{
                  color: DrawingState.action==label ? "primary.main" : "inherit",
                  backgroundColor: DrawingState.action==label ? "action.selected" : "transparent",
                  "&:hover": {
                    backgroundColor: DrawingState==label
                      ? "action.selected"
                      : "action.hover",
                  },
                }}
                onClick={()=>{
                  //console.log(DrawingState.action,label,DrawingState==label)
                  handleDrawingstate(label);}}>
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