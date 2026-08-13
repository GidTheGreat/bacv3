import { useState } from "react";

import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import CropSquareIcon from "@mui/icons-material/CropSquare";

import {
  Popover,
  ToggleButton,
  IconButton,
  Box,
} from "@mui/material";

import {
  Layout1Icon,
  Layout2Icon,
  Layout2RowsIcon,
  Layout3Icon,
  Layout3FlippedIcon,
  Layout4Icon,
} from "./layoutIcons";

import usePanelStore from "../../stores/panelStore";
import changeLayout from "./layoutManager";

export default function LayoutControls() {
  const activeLayout = usePanelStore(
    (s) => s.activeLayout
  );

  const setActiveLayout = usePanelStore(
    (s) => s.setActiveLayout
  );


  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const id = open
    ? "layout-popover"
    : undefined;

  const handleLayoutChange = (layout) => {
    
    changeLayout(layout);
    handleClose();
  };

  return (
    <Box>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
      >
        <ViewQuiltIcon />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box
          sx={{
            display: "flex",
            p: 1,
            gap: 1,
          }}
        >
          <ToggleButton
            selected={activeLayout === "monolith"}
            onClick={() => handleLayoutChange("monolith")}
          >
            <Layout1Icon />
          </ToggleButton>

          <ToggleButton
            selected={activeLayout === "twoColumns"}
            onClick={() => handleLayoutChange("twoColumns")}
          >
            <Layout2Icon />
          </ToggleButton>

          <ToggleButton
            selected={activeLayout === "twoRows"}
            onClick={() => handleLayoutChange("twoRows")}
          >
            <Layout2RowsIcon />
          </ToggleButton>

          <ToggleButton
            selected={activeLayout === "triangle"}
            onClick={() => handleLayoutChange("triangle")}
          >
            <Layout3Icon />
          </ToggleButton>

          <ToggleButton
            selected={activeLayout === "flippedTriangle"}
            onClick={() => handleLayoutChange("flippedTriangle")}
          >
            <Layout3FlippedIcon />
          </ToggleButton>

          <ToggleButton
            value={4}
            selected={activeLayout === "fourGrid"}
            onClick={() => handleLayoutChange("fourGrid")}
          >
            <Layout4Icon />
          </ToggleButton>
        </Box>
      </Popover>
    </Box>
  );
}