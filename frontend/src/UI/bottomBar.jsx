import {
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import Clock from "./time";

export default function BottomBar() {
  return (
    <Paper
      sx={{
        height: "100%",
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left */}

      <Stack
        direction="row"
        spacing={2}
      >
        <Typography variant="caption">
          ● Connected
        </Typography>

       
      </Stack>

      {/* Center */}

      

      {/* Right */}

      <Stack
        direction="row"
        spacing={2}
      >
        <Clock/>

        
      </Stack>
    </Paper>
  );
}