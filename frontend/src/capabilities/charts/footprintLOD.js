// FootprintLOD.js

export function getRenderableCandles(
    bars,
    visibleRange,
    barSpacing,
    priceToCoordinate
) {
    const renderables = [];

    for (
        let i = visibleRange.from;
        i < visibleRange.to;
        i++
    ) {
        const bar = bars[i];

        if (!bar?.originalData) continue;

        const candle = bar.originalData;

        const highY = priceToCoordinate(
            candle.high
        );

        const lowY = priceToCoordinate(
            candle.low
        );

        if (
            highY == null ||
            lowY == null
        ) {
            continue;
        }

        const footprint = candle.footprint;

        if (!footprint) continue;

        const {
            rows,
            poc,
            vah,
            val,
            totalVolume,
            maxVolume,
        } = footprint;

        const candleTop = Math.min(
            highY,
            lowY
        );

        const candleBottom = Math.max(
            highY,
            lowY
        );

        const candleHeight =
            candleBottom - candleTop;

        const rowHeight =
            candleHeight / rows.length;

        const candleWidth =
            Math.max(
                4,
                barSpacing * 0.2
            );

        const ladderWidth =
            Math.max(
                4,
                barSpacing * 0.35
            );

        const openY =
            priceToCoordinate(
                candle.open
            );

        const closeY =
            priceToCoordinate(
                candle.close
            );

        const footerY =
            candleBottom + 12;

        renderables.push({
            candle,
            x: bar.x,

            highY,
            lowY,

            openY,
            closeY,

            candleTop,
            candleBottom,

            candleWidth,
            ladderWidth,

            rowHeight,

            footerY,

            rows,

            poc,
            vah,
            val,

            totalVolume,
            maxVolume,
        });
    }

    return renderables;
}