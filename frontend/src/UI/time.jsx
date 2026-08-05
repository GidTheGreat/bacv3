import { useEffect, useState } from "react";
import {
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";

const TIMEZONES = [
  "UTC",
  "Africa/Nairobi",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function Clock() {
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const [time, setTime] = useState(new Date());

  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const formatted = new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(time);

  return (
    <>
      <Typography
        variant="caption"
        sx={{
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        {formatted} ({timezone})
      </Typography>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {TIMEZONES.map((tz) => (
          <MenuItem
            key={tz}
            selected={tz === timezone}
            onClick={() => {
              setTimezone(tz);
              setAnchorEl(null);
            }}
          >
            {tz}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}