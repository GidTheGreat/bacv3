import { useState } from "react";

import {
  Box,
  IconButton,
  Popover,
  Slider,
} from "@mui/material";

import ReplayIcon from "@mui/icons-material/Replay";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";

//import useReplayStore from "../../stores/replayStore";

export default function ReplayButton() {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = useReplayStore((s) => s.open);
  const playing = useReplayStore((s) => s.playing);
  const cursor = useReplayStore((s) => s.cursor);

  const openPopup = useReplayStore((s) => s.openPopup);
  const closePopup = useReplayStore((s) => s.closePopup);
  const togglePlaying = useReplayStore((s) => s.togglePlaying);
  const setCursor = useReplayStore((s) => s.setCursor);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    openPopup();
  };

  const handleClose = () => {
    setAnchorEl(null);
    closePopup();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
      >
        <ReplayIcon />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            mt: 0.5,
            px: 1,
            py: 0.75,

            minWidth: 340,

            borderRadius: 2,

            bgcolor: "#1a2038",
            border: "1px solid #39456f",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <IconButton
            size="small"
          >
            <FastRewindIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={togglePlaying}
          >
            {playing ? (
              <PauseIcon fontSize="small" />
            ) : (
              <PlayArrowIcon fontSize="small" />
            )}
          </IconButton>

          <IconButton
            size="small"
          >
            <FastForwardIcon fontSize="small" />
          </IconButton>

          <Slider
            size="small"
            value={cursor ?? 0}
            onChange={(_, value) => setCursor(value)}
            min={0}
            max={100}
            sx={{
              ml: 1,
              width: 180,
            }}
          />
        </Box>
      </Popover>
    </>
  );
}