function fmtVol(v) {
    if (v >= 1_000_000) {
        return (
            v / 1_000_000
        ).toFixed(2) + "M";
    }

    if (v >= 1_000) {
        return (
            v / 1_000
        ).toFixed(2) + "K";
    }

    return Number(v).toFixed(0);
}

function heatColor(
    value,
    max,
    side
) {
    const ratio =
        max === 0
            ? 0
            : value / max;

    if (ratio > 0.95) {
        return "#ffffff";
    }

    const intensity =
        Math.floor(
            25 + ratio * 180
        );

    return side === "buy"
        ? `rgb(0,${intensity},0)`
        : `rgb(${intensity},0,0)`;
}


export function drawRows(ctx, r) {
    r.rows.forEach(row => {

        const buyColor =
            heatColor(
                row.buy,
                r.maxVolume,
                "buy"
            );

        const sellColor =
            heatColor(
                row.sell,
                r.maxVolume,
                "sell"
            );

        

        ctx.fillStyle = sellColor;

        ctx.fillRect(
            row.sellX,
            row.y,
            r.ladderWidth,
            row.height
        );

        ctx.fillStyle = buyColor;

        ctx.fillRect(
            row.buyX,
            row.y,
            r.ladderWidth,
            row.height
        );

        ctx.fillStyle =
            sellColor === "#ffffff"
                ? "#000"
                : "#fff";

        ctx.fillText(
            fmtVol(row.sell),
            row.sellX +
                r.ladderWidth / 2,
            row.y +
                row.height / 2
        );

        ctx.fillStyle =
            buyColor === "#ffffff"
                ? "#000"
                : "#fff";

        ctx.fillText(
            fmtVol(row.buy),
            row.buyX +
                r.ladderWidth / 2,
            row.y +
                row.height / 2
        );
    });
}

export function drawValueArea(ctx, r) {

    r.rows.forEach(row => {

        if (
            row.price < r.val ||
            row.price > r.vah
        ) {
            return;
        }


        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = 1;

        ctx.strokeRect(
            row.sellX,
            row.y,
            r.ladderWidth,
            row.height
        );

        ctx.strokeRect(
            row.buyX,
            row.y,
            r.ladderWidth,
            row.height
        );
    });

}

export function drawPOC(ctx, r) {

    r.rows.forEach(row => {

        if (row.price !== r.poc) return;

        

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;

        ctx.strokeRect(
            row.sellX,
            row.y,
            r.ladderWidth * 2 +
                r.candleWidth,
            row.height
        );

    });

}

export function drawWick(ctx, r) {

    ctx.strokeStyle =
        r.candle.close >=
        r.candle.open
            ? "#00d084"
            : "#ff4d4d";

    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(r.x, r.highY);
    ctx.lineTo(r.x, r.lowY);
    ctx.stroke();

}

export function drawBody(ctx, r) {

    if (
        r.openY == null ||
        r.closeY == null
    ) {
        return;
    }

    const bodyTop =
        Math.min(
            r.openY,
            r.closeY
        );

    const bodyHeight =
        Math.max(
            2,
            Math.abs(
                r.closeY -
                r.openY
            )
        );

    ctx.fillStyle =
        r.candle.close >=
        r.candle.open
            ? "#00b386"
            : "#d94b4b";

    ctx.fillRect(
        r.x -
            r.candleWidth / 2,
        bodyTop,
        r.candleWidth,
        bodyHeight
    );

}

export function drawDelta(ctx, r) {

    const delta =
        r.candle.volume_delta ?? 0;

    ctx.font =
        "bold 10px sans-serif";

    ctx.fillStyle =
        delta >= 0
            ? "#00cc88"
            : "#ff5555";

    ctx.fillText(
        `${delta >= 0 ? "▲" : "▼"} ${fmtVol(
            Math.abs(delta)
        )}`,
        r.x,
        r.footerY
    );

}

export function drawTotalVolume(ctx, r) {

    ctx.fillStyle = "#ffffff";

    ctx.fillText(
        `Σ ${fmtVol(
            r.totalVolume
        )}`,
        r.x,
        r.footerY + 12
    );

    ctx.font =
        "8px sans-serif";

}