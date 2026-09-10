import {
  IconButton,
  Popper,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from "@mui/material";

import Replay from "@mui/icons-material/Replay";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";

import { useEffect, useRef, useState } from "react";

import useReplayStore from "../../stores/replayStore";
import useChartStore from "../../stores/chartStore";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";

export default function ReplayButton() {
  const replayState = useReplayStore((s) => s.replayState);
  const setReplayState = useReplayStore((s) => s.setReplayState);
  const setReplayActive = useReplayStore(s=>s.setReplayActive);
  const replayActive = useReplayStore(s=>s.replayActive);

  const replayKey = useReplayStore((s) => s.replayKey);
  const setReplayKey = useReplayStore((s) => s.setReplayKey);

  const selection = useChartStore((s) => s.selection);
  const data = useChartStore(s=>s.data);

  const platformRef = useRef(null);
  const symbolRef = useRef(null);
  const tradeRef = useRef(null);

  const progressRef = useRef(null);
  const draggingRef = useRef(false);

  const [anchorEl, setAnchorEl] = useState(null);

  /*
   * Build the available selections.
   */
  const platforms = new Set();
  const symbols = new Set();
  const trade_types = new Set();

  for (const chart of Object.keys(selection)) {
    if (chart.startsWith("default")) continue;

    selection[chart].platform &&
      platforms.add(selection[chart].platform);

    selection[chart].symbol &&
      symbols.add(selection[chart].symbol);

    selection[chart].trade &&
      trade_types.add(selection[chart].trade);
  }

  const replayKeyJoin =
    `${replayKey.platform}|${replayKey.trade}|${replayKey.symbol}`;

  const currentReplay = replayState?.[replayKeyJoin];
  const locked = currentReplay.locked;

  const dataLength = data?.[replayKeyJoin]?.["1min"]?.data.length;
  useEffect(() => {
        if (!replayActive) return;
        if (!currentReplay?.playing) return;

        const interval = setInterval(() => {
           const cursor =
    currentReplay.cursor =
        Math.min(
            dataLength ?? 300,
            currentReplay.cursor + 1
        );

            setReplayState(replayKeyJoin, "cursor", cursor)

        }, 250 / currentReplay.speed);

        return () => clearInterval(interval);

    }, [
        replayActive,
        currentReplay?.playing,
        currentReplay?.speed
    ]);
  
  //console.log("[replayButton]", dataLength);

  /*
   * Progress / cursor interaction
   *
   * x position -> cursor
   *
   * left edge  = 0
   * right edge = 300
   */
  const updateCursorFromPointer = (event) => {
    const element = progressRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();

    let ratio = (event.clientX - rect.left) / rect.width;

    ratio = Math.max(0, Math.min(1, ratio));

    const cursor = Math.round(ratio * (dataLength? dataLength: 300));
    //console.log("[replayButton] cursor", cursor);

    setReplayState(
      replayKeyJoin,
      "cursor",
      cursor
    );
  };

  const handlePointerDown = (event) => {
    draggingRef.current = true;

    // Capture the pointer so dragging can continue
    // even if the pointer leaves the progress region.
    event.currentTarget.setPointerCapture(event.pointerId);

    updateCursorFromPointer(event);
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current) return;

    updateCursorFromPointer(event);
  };

  const handlePointerUp = (event) => {
    draggingRef.current = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerCancel = () => {
    draggingRef.current = false;
  };

  const handleClick = (event) => {
    // pointerdown already updates the cursor, so no
    // separate click calculation is actually necessary.
  };

  

  const open = Boolean(anchorEl);
  const id = open ? "replay-popper" : undefined;

  const activeIcon = currentReplay?.playing
    ? <PauseIcon />
    : <PlayArrowIcon />;

  /*
   * Cursor percentage for the visual progress bar.
   */
  const cursor = currentReplay?.cursor ?? 0;
  const progress = (cursor / (dataLength? dataLength: 300)) * 100;

  /*useEffect(() => {
    console.log(useReplayStore.getState().replayActive);
  }, [useReplayStore.getState().replayActive]);*/

  return (
    <Box>
      <Tooltip title="Replay Controls"><IconButton
        aria-describedby={id}
        onClick={(event) => {
          setAnchorEl((current) =>
            current ? null : event.currentTarget
          );
          if (!locked){
            setReplayActive();
          }
          
        }}
        sx={{
          color: "text.secondary",

          "&:hover": {
            color: "primary.main",
            backgroundColor: "action.hover",
          },
        }}
      >
        <Replay />
      </IconButton></Tooltip>

      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{
    zIndex: (theme) => theme.zIndex.modal,
  }}
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 8],
            },
          },
        ]}
      >
        <Box
          sx={{
            p: 1.5,
            width: 330,
            borderRadius: 1.5,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 8,
            
          }}
        >

          {/* Selection controls */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1.2fr",
              gap: 0.75,
              pr: 3.5,

              "& select": {
                width: "100%",
                minWidth: 0,
                height: 32,
                padding: "0 7px",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.default",
                color: "text.primary",
                outline: "none",
                fontSize: 12,
                cursor: "pointer",

                "&:focus": {
                  borderColor: "primary.main",
                },
              },
            }}
          >
            <IconButton
              size="small"
              onClick={()=>{
                setReplayState(replayKeyJoin, "locked", !locked)
              }}
              sx={{
                position: "absolute",
                right: -2,
                top: "50%",
                transform: "translateY(-50%)",
                width: 24,
                height: 24,
                color: locked ? "primary.main" : "text.secondary",
              }}
            >
              {locked ? (
                <LockOutlinedIcon sx={{ fontSize: 16 }} />
              ) : (
                <LockOpenOutlinedIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
            <select
              ref={platformRef}
              value={replayKey.platform ?? ""}
              onChange={(e) =>
                setReplayKey({
                  platform: e.target.value,
                })
              }
              onClick={(e) => {
                const options = e.currentTarget.options;

                if (
                  options.length === 1 &&
                  e.currentTarget.selectedOptions[0].value !==
                    replayKey.platform
                ) {
                  setReplayKey({
                    platform:
                      e.currentTarget.selectedOptions[0].value,
                  });
                }
              }}
            >
              {Array.from(platforms).map((platform) => (
                <option value={platform} key={platform}>
                  {platform}
                </option>
              ))}
            </select>

            <select
              ref={tradeRef}
              value={replayKey.trade ?? ""}
              onChange={(e) =>
                setReplayKey({
                  trade: e.target.value,
                })
              }
              onClick={(e) => {
                const options = e.currentTarget.options;

                if (
                  options.length === 1 &&
                  e.currentTarget.selectedOptions[0].value !==
                    replayKey.trade
                ) {
                  setReplayKey({
                    trade:
                      e.currentTarget.selectedOptions[0].value,
                  });
                }
              }}
            >
              {Array.from(trade_types).map((trade) => (
                <option value={trade} key={trade}>
                  {trade=="um"?"USD-M":"COIN-M"}
                </option>
              ))}
            </select>

            <select
              ref={symbolRef}
              value={replayKey.symbol ?? ""}
              onChange={(e) =>
                setReplayKey({
                  symbol: e.target.value,
                })
              }
              onClick={(e) => {
                const options = e.currentTarget.options;

                if (
                  options.length === 1 &&
                  e.currentTarget.selectedOptions[0].value !==
                    replayKey.symbol
                ) {
                  setReplayKey({
                    symbol:
                      e.currentTarget.selectedOptions[0].value,
                  });
                }
              }}
            >
              {Array.from(symbols).map((symbol) => (
                <option value={symbol} key={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </Box>

          {/* Progress / cursor region */}
          <Box
            ref={progressRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            sx={{
              position: "relative",
              height: 32,
              display: "flex",
              alignItems: "center",
              cursor: "ew-resize",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            {/* Track */}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                height: 6,
                borderRadius: 3,
                backgroundColor: "action.hover",
              }}
            />

            {/* Progress */}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                width: `${progress}%`,
                height: 6,
                borderRadius: 3,
                backgroundColor: "primary.main",
                pointerEvents: "none",
              }}
            />

            {/* Cursor handle */}
            <Box
              sx={{
                position: "absolute",
                left: `${progress}%`,
                top: "50%",
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                border: "2px solid",
                borderColor: "background.paper",
                boxShadow: 2,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />

            {/* Cursor number */}
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                right: 0,
                top: -3,
                fontSize: 10,
                color: "text.secondary",
              }}
            >
              {cursor}/{(dataLength? dataLength: 300)}
            </Typography>
          </Box>

          {/* Playback controls */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={() =>
                setReplayState(
                  replayKeyJoin,
                  "cursor",
                  Math.max(
                    0,
                    (currentReplay?.cursor ?? 0) - 1
                  )
                )
              }
            >
              <SkipPreviousIcon fontSize="small" />
            </IconButton>

            <IconButton
              onClick={() => {
                const value =
                  currentReplay?.playing ? false : true;

                setReplayState(
                  replayKeyJoin,
                  "playing",
                  value
                );
              }}
              sx={{
                width: 42,
                height: 42,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {activeIcon}
            </IconButton>

            <IconButton
              size="small"
              onClick={() =>
                setReplayState(
                  replayKeyJoin,
                  "cursor",
                  Math.min(
                    (dataLength? dataLength: 300),
                    (currentReplay?.cursor ?? 0) + 1
                  )
                )
              }
            >
              <SkipNextIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Speed */}
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={currentReplay?.speed ?? 1}
            onChange={(event, value) => {
              if (value !== null) {
                setReplayState(
                  replayKeyJoin,
                  "speed",
                  value
                );
              }
            }}
            sx={{
              "& .MuiToggleButton-root": {
                flex: 1,
                minWidth: 0,
                py: 0.5,
                fontSize: 11,
                borderColor: "divider",
              },
            }}
          >
            <ToggleButton value={1}>1x</ToggleButton>
            <ToggleButton value={2}>2x</ToggleButton>
            <ToggleButton value={4}>4x</ToggleButton>
            <ToggleButton value={8}>8x</ToggleButton>
            <ToggleButton value={16}>16x</ToggleButton>
          </ToggleButtonGroup>

        </Box>
      </Popper>
    </Box>
  );
}