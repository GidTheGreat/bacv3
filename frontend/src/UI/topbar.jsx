import { AppBar, Box, Stack, Typography } from "@mui/material";

export default function UITopBar({
  logo,
  name,
  description,
  children,
  ...props
}) {
  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      {...props}
      sx={{
        px: 2,
        py: 1,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "transparent",
        ...props.sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {logo}

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              {name}
            </Typography>

            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
              >
                {description}
              </Typography>
            )}
          </Box>
        </Stack>

        {children}
      </Box>
    </AppBar>
  );
}