import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Divider,
  Button,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function PositionsUI({
  symbol,
  posSize,
  margin,
  entryPrice,
  pnl,
  side = "LONG",
  leverage = "10x",
  onClose,
}) {
  const isProfit = pnl >= 0;
  const isLong = side === "LONG";

  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        border: "1px solid",
        borderColor: isProfit
          ? "rgba(46, 204, 113, 0.25)"
          : "rgba(255, 82, 82, 0.25)",
        background: (theme) =>
          `linear-gradient(135deg, ${
            isProfit
              ? "rgba(46, 204, 113, 0.08)"
              : "rgba(255, 82, 82, 0.08)"
          }, ${theme.palette.background.paper} 55%)`,
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        minWidth: 300,
      }}
    >
      {/* Accent bar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: isProfit ? "success.main" : "error.main",
        }}
      />

      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          mb={2}
        >
          <Stack direction="row"  spacing={1}>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ letterSpacing: "-0.02em" }}
            >
              {symbol}
            </Typography>

            <Chip
              label={side}
              size="small"
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 800,
                borderRadius: 1,
                bgcolor: isLong
                  ? "rgba(46, 204, 113, 0.14)"
                  : "rgba(255, 82, 82, 0.14)",
                color: isLong ? "success.main" : "error.main",
              }}
            />

            <Chip
              label={leverage}
              size="small"
              variant="outlined"
              sx={{
                height: 22,
                fontSize: 10,
                fontWeight: 700,
              }}
            />
          </Stack>

          <Button
            onClick={onClose}
            size="small"
            color="error"
            variant="outlined"
            startIcon={<CloseIcon fontSize="small" />}
            sx={{
              minWidth: 0,
              px: 1,
              py: 0.4,
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Close
          </Button>
        </Stack>

        {/* PnL */}
        <Box
          sx={{
            p: 1.75,
            mb: 2,
            borderRadius: 2,
            bgcolor: isProfit
              ? "rgba(46, 204, 113, 0.08)"
              : "rgba(255, 82, 82, 0.08)",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
          >
            Unrealized PnL
          </Typography>

          <Typography
            variant="h5"
            fontWeight={800}
            color={isProfit ? "success.main" : "error.main"}
            sx={{
              mt: 0.25,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {isProfit ? "+" : ""}
            {pnl}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Details */}
        <Stack spacing={1.5}>
          <PositionRow label="Position Size" value={posSize} />
          <PositionRow label="Margin" value={margin} />
          <PositionRow label="Entry Price" value={entryPrice} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function PositionRow({ label, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={700}
        sx={{
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.01em",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default PositionsUI;