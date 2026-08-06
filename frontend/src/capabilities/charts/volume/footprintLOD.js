// FootprintLOD.js



function getLOD(barSpacing) {
    if (barSpacing >= 80) return "full";
    if (barSpacing >= 40) return "medium";
    if (barSpacing >= 20) return "low";
    return "minimal";
}

export function getRenderableCandles(
    bars,
    visibleRange,
    barSpacing,
    priceToCoordinate
) {

    const lod = getLOD(barSpacing);
    //console.log(lod)
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

        const renderRows = rows.map((row, idx) => ({
                ...row,

                y: candleTop + idx * rowHeight,

                sellX:
                    bar.x -
                    candleWidth / 2 -
                    ladderWidth,

                buyX:
                    bar.x +
                    candleWidth / 2,

                height: rowHeight,
            }));

        

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

            rows: renderRows,

            poc,
            vah,
            val,

            totalVolume,
            maxVolume,
        });
    }

    return renderables;
}