export function getActiveDrawingSeries(renderState) {
  const series = renderState?.current?.series;
  if (!series) return null;

  return series.candle || series.area || null;
}

export function chartPointToAnchor(chart, series, point) {
  if (!chart || !series || !point) return null;

  const logical = chart.timeScale().coordinateToLogical(point.x);
  const price = series.coordinateToPrice(point.y);
  if (logical === null || price === null) return null;

  return { logical, price };
}

export function anchorToPoint(chart, series, anchor) {
  if (!chart || !series || !anchor) return null;

  const x = chart.timeScale().logicalToCoordinate(anchor.logical);
  const y = series.priceToCoordinate(anchor.price);
  if (x === null || y === null) return null;

  return { x, y };
}

export function priceToY(series, price) {
  if (!series || price == null) return null;

  return series.priceToCoordinate(price);
}

export function logicalToX(chart, logical) {
  if (!chart || logical == null) return null;

  return chart.timeScale().logicalToCoordinate(logical);
}

export function hitTestLongShortHandle(
    chart,
    series,
    drawing,
    point,
    size = 18
) {

    if (
        drawing.type !== "long" &&
        drawing.type !== "short"
    ) {
        return null;
    }

    const x1 = logicalToX(chart, drawing.leftLogical);
    const x2 = logicalToX(chart, drawing.rightLogical);

    const targetY = priceToY(series, drawing.targetPrice);
    const entryY = priceToY(series, drawing.entryPrice);
    const stopY = priceToY(series, drawing.stopPrice);

    if (
        x1 == null ||
        x2 == null ||
        targetY == null ||
        entryY == null ||
        stopY == null
    ) {
        return null;
    }

    const handles = [

        {
            mode: "target",
            x: x1,
            y: targetY,
        },

        {
            mode: "target",
            x: x2,
            y: targetY,
        },

        {
            mode: "stop",
            x: x1,
            y: stopY,
        },

        {
            mode: "stop",
            x: x2,
            y: stopY,
        },

        {
            mode: "left",
            x: x1,
            y: entryY,
        },

        {
            mode: "right",
            x: x2,
            y: entryY,
        },

    ];

    for (const handle of handles) {

        if (
            Math.abs(point.x - handle.x) <= size &&
            Math.abs(point.y - handle.y) <= size
        ) {
            return handle.mode;
        }

    }

    return null;
}

export function hitTestDrawing(chart, series, drawing, point, tolerance = 6) {
  if (!point || !drawing) return false;

  if (drawing.type === "horizontal") {
    const y = priceToY(series, drawing.price);
    return y !== null && Math.abs(point.y - y) <= tolerance;
  }

  if (drawing.type === "vertical") {
    const x = logicalToX(chart, drawing.logical);
    return x !== null && Math.abs(point.x - x) <= tolerance;
  }

  if (drawing.type === "trendline") {
    const start = anchorToPoint(chart, series, drawing.start);
    const end = anchorToPoint(chart, series, drawing.end);
    if (!start || !end) return false;

    return pointToSegmentDistance(point, start, end) <= tolerance;
  }

  if (drawing.type === "long" || drawing.type === "short") {

        const x1 = logicalToX(chart, drawing.leftLogical);
        const x2 = logicalToX(chart, drawing.rightLogical);

        const y1 = priceToY(series, drawing.targetPrice);
        const y2 = priceToY(series, drawing.stopPrice);

        if (
            x1 == null ||
            x2 == null ||
            y1 == null ||
            y2 == null
        ) {
            return false;
        }

        const left = Math.min(x1, x2);
        const right = Math.max(x1, x2);

        const top = Math.min(y1, y2);
        const bottom = Math.max(y1, y2);

        return (
            point.x >= left &&
            point.x <= right &&
            point.y >= top &&
            point.y <= bottom
        );
    }

  return false;
}

function pointToSegmentDistance(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared
    )
  );

  const projection = {
    x: start.x + t * dx,
    y: start.y + t * dy,
  };

  return Math.hypot(point.x - projection.x, point.y - projection.y);
}