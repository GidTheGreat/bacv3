import { Toolbar, Box } from "@mui/material";

export default function UIToolbar({
  left,
  center,
  right,
  children,
  sx,
  ...props
}) {
  const hasSlots = left || center || right;

  return (
    <Toolbar
      disableGutters
      {...props}
      sx={{
        minHeight: "unset",
        px: 1,
        overflow: "hidden",
        ...sx,
      }}
    >
      {hasSlots ? (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minWidth: 0,
              gap: 1,
            }}
          >
            {left}
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minWidth: 0,
              gap: 1,
            }}
          >
            {center}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              minWidth: 0,
              gap: 1,
            }}
          >
            {right}
          </Box>
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            minWidth: 0,
            gap: 1,
            overflowX: "auto",
            overflowY: "hidden",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {children}
        </Box>
      )}
    </Toolbar>
  );
}