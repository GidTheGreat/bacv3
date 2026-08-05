import {
  anchorToPoint,
  getActiveDrawingSeries,
  logicalToX,
  priceToY,
} from "./drawingGeometry";

function fillRect(context, x1, x2, y1, y2, color) {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  context.save();
  context.fillStyle = color;
  context.fillRect(left, top, width, height);
  context.restore();
}


class DrawingsView {
  constructor(source) {
    this.source = source;
  }

  renderer() {
    return new DrawingsRenderer(this.source);
  }
}

class DrawingsRenderer {
  constructor(source) {
    this.source = source;
  }

  draw(target) {
    target.useMediaCoordinateSpace(({ context, mediaSize }) => {
      const chart = this.source.ctx.chartRef.current;
      const series = getActiveDrawingSeries(this.source.ctx.renderState);
      if (!chart || !series) return;

      for (const drawing of this.source.drawings) {
        drawOne(context, mediaSize, chart, series, drawing);
      }

      if (this.source.draft) {
        drawOne(context, mediaSize, chart, series, {
          ...this.source.draft,
          draft: true,
        });
      }
    });
  }
}

function drawLabel(
            context,
            x,
            y,
            lines,
            {
                background = "#111",
                color = "#fff",
                border = "#555",
            } = {}
        ) {

            context.save();

            context.font = "12px sans-serif";

            const padding = 6;
            const lineHeight = 16;

            const width =
                Math.max(...lines.map(line => context.measureText(line).width))
                + padding * 2;

            const height =
                lines.length * lineHeight + padding * 2;

            const top = y - height / 2;

            context.fillStyle = background;
            context.fillRect(x, top, width, height);

            context.strokeStyle = border;
            context.lineWidth = 1;
            context.strokeRect(x, top, width, height);

            context.fillStyle = color;

            lines.forEach((line, i) => {

                context.fillText(
                    line,
                    x + padding,
                    top + padding + 12 + i * lineHeight
                );

            });

            context.restore();

            return {
                width,
                height,
            };
        }

function drawOne(context, mediaSize, chart, series, drawing) {
  if (drawing.type === "horizontal") {
    const y = priceToY(series, drawing.price);
    if (y === null) return;

    strokePath(context, drawing, () => {
      context.moveTo(0, y);
      context.lineTo(mediaSize.width, y);
    });
    return;
  }

  if (drawing.type === "vertical") {
    const x = logicalToX(chart, drawing.logical);
    if (x === null) return;

    strokePath(context, drawing, () => {
      context.moveTo(x, 0);
      context.lineTo(x, mediaSize.height);
    });
    return;
  }

  if (drawing.type === "trendline") {
    const start = anchorToPoint(chart, series, drawing.start);
    const end = anchorToPoint(chart, series, drawing.end);
    if (!start || !end) return;

    strokePath(context, drawing, () => {
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
    });
  }

  if (drawing.type === "long" || drawing.type === "short") {

      const x1 = logicalToX(chart, drawing.leftLogical);
      const x2 = logicalToX(chart, drawing.rightLogical);

      const entryY = priceToY(series, drawing.entryPrice);
      const stopY = priceToY(series, drawing.stopPrice);
      const targetY = priceToY(series, drawing.targetPrice);

      if (
        x1 == null ||
        x2 == null ||
        entryY == null ||
        stopY == null ||
        targetY == null
      ) {
        return;
      }

      const isLong = drawing.type === "long";

      const reward = Math.abs(
          drawing.targetPrice - drawing.entryPrice
      );

      const risk = Math.abs(
          drawing.stopPrice - drawing.entryPrice
      );

      const rr =
          risk === 0
              ? 0
              : reward / risk;

      const targetLines = [
          "Target",
          drawing.targetPrice.toFixed(2),
          `${isLong ? "+" : "-"}${reward.toFixed(2)}`,
      ];

      const stopLines = [
          "Stop",
          drawing.stopPrice.toFixed(2),
          `${isLong ? "-" : "+"}${risk.toFixed(2)}`,
      ];

      const entryLines = [
          "Entry",
          drawing.entryPrice.toFixed(2),
          "Reward : Risk",
          `${rr.toFixed(2)} : 1`,
      ];

      function drawHandle(context, x, y) {

          const size = 12;

          context.save();

          context.fillStyle = "#ffffff";
          context.strokeStyle = "#2d7ff9";
          context.lineWidth = 1.5;

          context.beginPath();
          context.rect(
              x - size / 2,
              y - size / 2,
              size,
              size
          );

          context.fill();
          context.stroke();

          context.restore();
      }

      // reward area (always green)
      fillRect(
        context,
        x1,
        x2,
        entryY,
        targetY,
        "rgba(0,200,0,0.25)"
      );


      // risk area
      // risk area (always red)
      fillRect(
        context,
        x1,
        x2,
        entryY,
        stopY,
        "rgba(220,0,0,0.25)"
      );

      
      
      // lines
      strokePath(context, drawing, () => {

        context.moveTo(x1, targetY);
        context.lineTo(x2, targetY);

        context.moveTo(x1, entryY);
        context.lineTo(x2, entryY);

        context.moveTo(x1, stopY);
        context.lineTo(x2, stopY);

      });

      const labelX = x2 + 10;

      drawLabel(
          context,
          labelX,
          targetY,
          targetLines,
          {
              background: "rgba(0,180,0,.9)",
              border: "#00ff66",
          }
      );

      drawLabel(
          context,
          labelX,
          entryY,
          entryLines,
          {
              background: "#202020",
              border: "#888",
          }
      );

      drawLabel(
          context,
          labelX,
          stopY,
          stopLines,
          {
              background: "rgba(180,0,0,.9)",
              border: "#ff5555",
          }
      );

      if (drawing.selected) {

        // target edge
        drawHandle(context, x1, targetY);
        drawHandle(context, x2, targetY);

        // stop edge
        drawHandle(context, x1, stopY);
        drawHandle(context, x2, stopY);

        // width handles
        drawHandle(context, x1, entryY);
        drawHandle(context, x2, entryY);

    }

      return;
    }
}

function strokePath(context, drawing, path) {
  context.save();
  context.beginPath();
  path();
  context.lineWidth = drawing.selected ? 2 : 1;
  context.strokeStyle = drawing.selected ? "#58a6ff" : "#f0b90b";
  context.setLineDash(drawing.draft ? [2, 4] : drawing.selected ? [] : [6, 4]);
  context.stroke();
  context.restore();
}

export class DrawingsPrimitive {
  constructor(ctx) {
    this.ctx = ctx;
    this.drawings = [];
    this.draft = null;
    this.view = new DrawingsView(this);
    this.requestUpdate = null;
  }

  attached({ requestUpdate }) {
    this.requestUpdate = requestUpdate;
  }

  detached() {
    this.requestUpdate = null;
  }

  paneViews() {
    return [this.view];
  }

  setDrawings(drawings, draft = null) {
    this.drawings = drawings;
    this.draft = draft;
    this.requestUpdate?.();
  }
}