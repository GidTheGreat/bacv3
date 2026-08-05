import {
  Box,
  IconButton,
  Typography,
} from "@mui/material";

import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";

export default function ReplayPanel({
  playing = false,
  speed = 1,
  progress = 0,
  startLabel = "--",
  endLabel = "--",

  onBack,
  onPlayPause,
  onForward,
  onSpeed,
  onProgress,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: 2,
        p: 2,
      }}
    >
      {/* Header */}

      <Typography variant="h6">
        Replay
      </Typography>

      {/* Date Range */}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          textAlign: "center",
        }}
      >
        {startLabel} → {endLabel}
      </Typography>

      {/* Progress */}

      <Box
        onClick={onProgress}
        sx={{
          height: 24,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: 8,
            bgcolor: "action.hover",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${progress}%`,
              height: "100%",
              bgcolor: "primary.main",
            }}
          />
        </Box>
      </Box>

      {/* Controls */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <IconButton
          onClick={onBack}
          sx={{
            border: 1,
            borderColor: "divider",
          }}
        >
          <SkipPreviousIcon />
        </IconButton>

        <IconButton
          onClick={onPlayPause}
          sx={{
            border: 1,
            borderColor: "divider",
          }}
        >
          {playing ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>

        <IconButton
          onClick={onForward}
          sx={{
            border: 1,
            borderColor: "divider",
          }}
        >
          <SkipNextIcon />
        </IconButton>

        <IconButton
          onClick={onSpeed}
          sx={{
            width: 56,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            typography: "button",
          }}
        >
          {speed}×
        </IconButton>
      </Box>
    </Box>
  );
}