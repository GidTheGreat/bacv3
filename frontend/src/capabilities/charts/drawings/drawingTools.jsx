import { useEffect, useRef, useState } from "react";
import DrawingToolbar from "./drawingToolBar";
import { DrawingsPrimitive } from "./drawingPrimitive";
import {
  chartPointToAnchor,
  getActiveDrawingSeries,
  hitTestDrawing,
  hitTestLongShortHandle,
} from "./drawingGeometry";

import useDrawingStore from "./drawingStore";

const drawingTools = new Set([
  "cursor",
  "horizontal",
  "vertical",
  "trendline",
  "long",
  "short",
]);

const visibleToolIds = [
  "cursor",
  "horizontal",
  "vertical",
  "trendline",
  "long",
  "short",
];

function makeId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function makeHorizontalLine(anchor) {
  return {
    id: makeId(),
    type: "horizontal",
    price: anchor.price,
  };
}

function makeVerticalLine(anchor) {
  return {
    id: makeId(),
    type: "vertical",
    logical: anchor.logical,
  };
}

function makeTrendline(start, end) {
  return {
    id: makeId(),
    type: "trendline",
    start,
    end,
  };
}

function makeLong(anchor) {
  return {
    id: makeId(),
    type: "long",

    leftLogical: anchor.logical - 3,
    rightLogical: anchor.logical + 3,

    entryPrice: anchor.price,

    stopPrice: anchor.price - (anchor.price * 0.0009),
    targetPrice: anchor.price + (anchor.price * 0.0009) * 2,
  };
}

function makeShort(anchor) {
  return {
    id: makeId(),
    type: "short",

    leftLogical: anchor.logical - 3,
    rightLogical: anchor.logical + 3,

    entryPrice: anchor.price,

    stopPrice: anchor.price + (anchor.price * 0.0009),
    targetPrice: anchor.price - (anchor.price * 0.0009) * 2,
  };
}

const EMPTY_DRAWINGS = [];
export default function DrawingTools({ ctx }) {
  const [activeTool, setActiveTool] = useState(null);

  const drawings = useDrawingStore(
    s => s.drawings[ctx.k1] ?? EMPTY_DRAWINGS
);

  const addDrawing = useDrawingStore(s => s.addDrawing);
  const updateDrawing = useDrawingStore(s => s.updateDrawing);
  const deleteDrawing = useDrawingStore(s => s.deleteDrawing);
  const clearDrawings = useDrawingStore(s => s.clearDrawings);
    

  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const dragRef = useRef(null);
  const { chartRef, containerRef, renderState } = ctx;
  const [primitive] = useState(() => new DrawingsPrimitive(ctx));
  const stateRef = useRef({
    activeTool,
    drawings,
    selectedId,
    draft,
  });

  useEffect(() => {
  stateRef.current = {
    activeTool,
    drawings,
    selectedId,
    draft,
  };

  primitive.setDrawings(
    drawings.map(drawing => ({
      ...drawing,
      selected: drawing.id === selectedId,
    })),
    draft
  );

}, [
  activeTool,
  drawings,
  selectedId,
  draft,
  primitive
]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const pane = chart.panes?.()[0];
    if (!pane) return;

    const container = containerRef.current;
    if (!container) return;

    pane.attachPrimitive(primitive);

    const handleClick = (param) => {
      if (!param.point) return;

      const series = getActiveDrawingSeries(renderState);
      const tool = stateRef.current.activeTool;
      if (!series || !drawingTools.has(tool || "cursor")) return;

      if (tool === "horizontal" || tool === "vertical") {
        const anchor = chartPointToAnchor(chart, series, param.point);
        if (!anchor) return;

        const drawing = tool === "horizontal"
        ? makeHorizontalLine(anchor)
        : makeVerticalLine(anchor);

        addDrawing(ctx.k1, drawing);
        setSelectedId(drawing.id);
        setDraft(null);
        setActiveTool(null);
        return;
      }

      if (tool === "trendline") {
        const anchor = chartPointToAnchor(chart, series, param.point);
        if (!anchor) return;

        const currentDraft = stateRef.current.draft;
        if (!currentDraft) {
          setSelectedId(null);
          setDraft({ type: "trendline", start: anchor, end: anchor });
          return;
        }

        const drawing = makeTrendline(
            currentDraft.start,
            anchor
        );
        addDrawing(ctx.k1, drawing);
        setSelectedId(drawing.id);
        setDraft(null);
        setActiveTool(null);
        return;
      }

      if (tool === "long" || tool === "short") {

          const anchor = chartPointToAnchor(chart, series, param.point);
          if (!anchor) return;

          const drawing =
            tool === "long"
                ? makeLong(anchor)
                : makeShort(anchor);
          //console.log("LONG CREATED", drawing);
          addDrawing(ctx.k1, drawing);
          setSelectedId(drawing.id);
          setActiveTool(null);

          return;
        }
      const hit = [...stateRef.current.drawings]
        .reverse()
        .find(drawing => hitTestDrawing(chart, series, drawing, param.point));

      setSelectedId(hit?.id ?? null);
    };

    const handleCrosshairMove = (param) => {
      const currentDraft = stateRef.current.draft;
      if (stateRef.current.activeTool !== "trendline" || !currentDraft || !param.point) {
        return;
      }

      const series = getActiveDrawingSeries(renderState);
      if (!series) return;

      const anchor = chartPointToAnchor(chart, series, param.point);
      if (!anchor) return;

      setDraft({
        ...currentDraft,
        end: anchor,
      });
    };

    function handlePointerDown(e) {

          const rect = container.getBoundingClientRect();

          const point = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
          };

          const series = getActiveDrawingSeries(renderState);
          if (!series) return;

          const hit = [...stateRef.current.drawings]
              .reverse()
              .find(d => hitTestDrawing(chart, series, d, point));

          if (!hit) return;

          const mode = hitTestLongShortHandle(
              chart,
              series,
              hit,
              point
          );

          //console.log(mode);

          const anchor = chartPointToAnchor(chart, series, point);
          if (!anchor) return;

          dragRef.current = {
              mode: mode ?? "move",

              id: hit.id,

              startAnchor: anchor,

              original: structuredClone(hit),
          };

          chart.applyOptions({
            handleScroll: false,
            handleScale: false,
        });

          setSelectedId(hit.id);
      }

    function handlePointerMove(e) {

        if (!dragRef.current) return;

        const rect = container.getBoundingClientRect();

        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        const series = getActiveDrawingSeries(renderState);
        if (!series) return;

        const anchor = chartPointToAnchor(chart, series, point);
        if (!anchor) return;

        const start = dragRef.current.startAnchor;
        const original = dragRef.current.original;

        const mode = dragRef.current.mode;

        const logicalDelta = anchor.logical - start.logical;
        const priceDelta = anchor.price - start.price;

        if (mode === "move") {

            updateDrawing(ctx.k1, original.id, {

              leftLogical:
                  original.leftLogical + logicalDelta,

              rightLogical:
                  original.rightLogical + logicalDelta,

              entryPrice:
                  original.entryPrice + priceDelta,

              stopPrice:
                  original.stopPrice + priceDelta,

              targetPrice:
                  original.targetPrice + priceDelta,

          });

            return;
        }

        if (mode === "target") {

            updateDrawing(ctx.k1, original.id, {
                targetPrice: anchor.price,
            });



            return;
        }

        if (mode === "stop") {

            updateDrawing(ctx.k1, original.id, {
                stopPrice: anchor.price,
            });

              return;
        }

        if (mode === "left") {

            updateDrawing(ctx.k1, original.id, {
                leftLogical: anchor.logical,
            });

            return;
        }

        if (mode === "right") {

            updateDrawing(ctx.k1, original.id, {
                rightLogical: anchor.logical,
            });

            return;
        }

        
    }

    function handlePointerUp() {

        dragRef.current = null;

        chart.applyOptions({
            handleScroll: true,
            handleScale: true,
        });
    }

    chart.subscribeClick(handleClick);
    chart.subscribeCrosshairMove(handleCrosshairMove);
    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      chart.unsubscribeClick(handleClick);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      pane.detachPrimitive(primitive);
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [chartRef, renderState, primitive]);

  const handleSelectTool = (tool) => {
    setSelectedId(null);
    setDraft(null);
    setActiveTool(tool === "cursor" ? null : tool);
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;

    deleteDrawing(ctx.k1, selectedId);
    setSelectedId(null);
  };

  const handleDeleteAll = () => {
    clearDrawings(ctx.k1);
    setSelectedId(null);
    setDraft(null);
  };

  return (
    <DrawingToolbar
      activeTool={activeTool ?? "cursor"}
      onSelectTool={handleSelectTool}
      onDeleteSelected={handleDeleteSelected}
      onDeleteAll={handleDeleteAll}
      toolIds={visibleToolIds}
    />
  );
}