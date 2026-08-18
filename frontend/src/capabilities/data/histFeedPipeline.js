const TIMEFRAMES = {
    
    "1h": 3600,
    "4h": 14400,
};

const STREAM_KEY = "binance|futures trade|BTCUSDT";

export class DataFeedPipeline {
    constructor() {
        this.history = {};
    }

    consumeB(rows) {
        // Create independent batch state for every timeframe.
        this.history = {};

        for (const [label, seconds] of Object.entries(TIMEFRAMES)) {
            this.history[label] = {
                tfSeconds: seconds,
                candles: [],
                cursor: null,
            };
        }

        // Process the entire historical dataset in one pass.
        for (const row of rows) {
            const price = Number(row.price);
            const volume = Number(row.quantity);
            const time = Number(row.transact_time);

            if (
                !Number.isFinite(price) ||
                !Number.isFinite(volume) ||
                !Number.isFinite(time)
            ) {
                continue;
            }

            const tick = {
                time: Math.floor(time / 1000),
                value: price,
                volume,
                notional: price * volume,
                aggressor: row.is_buyer_maker
                    ? "seller"
                    : "buyer",
            };

            for (const state of Object.values(this.history)) {
                this.processTick(state, tick);
            }
        }

        // Close and prepare the final candle of every timeframe.
        for (const [label, state] of Object.entries(this.history)) {
            if (state.cursor) {
                state.candles.push(
                    this.finalizeCandle(state.cursor.candle)
                );
            }

            postMessage({
                type: "setData",
                streamKey: STREAM_KEY,
                timeframe: label,
                data: state.candles,
            });
        }
    }

    processTick(state, tick) {
        const bucket =
            Math.floor(tick.time / state.tfSeconds) *
            state.tfSeconds;

        // First candle.
        if (!state.cursor) {
            state.cursor = this.newCursor(bucket, tick);
            return;
        }

        // New bucket: finalize the previous candle.
        if (bucket !== state.cursor.bucket) {
            state.candles.push(
                this.finalizeCandle(state.cursor.candle)
            );

            state.cursor = this.newCursor(bucket, tick);
            return;
        }

        const cursor = state.cursor;
        const candle = cursor.candle;

        // OHLC
        if (tick.value > candle.high) {
            candle.high = tick.value;
        }

        if (tick.value < candle.low) {
            candle.low = tick.value;
        }

        candle.close = tick.value;

        // Volume
        cursor.totalVolume += tick.notional;
        cursor.totalVolumeVolume += tick.volume;

        if (tick.aggressor === "buyer") {
            cursor.volumeDelta += tick.notional;
            cursor.volumeDeltaVolume += tick.volume;
        } else {
            cursor.volumeDelta -= tick.notional;
            cursor.volumeDeltaVolume -= tick.volume;
        }

        candle.total_volume = cursor.totalVolume;
        candle.total_volume_volume = cursor.totalVolumeVolume;

        candle.volume_delta = cursor.volumeDelta;
        candle.volume_delta_volume =
            cursor.volumeDeltaVolume;

        // Price-level footprint.
        let level = cursor.bins[tick.value];

        if (!level) {
            level = {
                buy: 0,
                sell: 0,
                buy_volume: 0,
                sell_volume: 0,
            };

            cursor.bins[tick.value] = level;
        }

        if (tick.aggressor === "buyer") {
            level.buy += tick.notional;
            level.buy_volume += tick.volume;
        } else {
            level.sell += tick.notional;
            level.sell_volume += tick.volume;
        }

        candle.binned_profile = cursor.bins;
    }

    newCursor(bucket, tick) {
        const bins = {};

        bins[tick.value] = {
            buy: tick.aggressor === "buyer"
                ? tick.notional
                : 0,

            sell: tick.aggressor === "seller"
                ? tick.notional
                : 0,

            buy_volume: tick.aggressor === "buyer"
                ? tick.volume
                : 0,

            sell_volume: tick.aggressor === "seller"
                ? tick.volume
                : 0,
        };

        const volumeDelta =
            tick.aggressor === "buyer"
                ? tick.notional
                : -tick.notional;

        const volumeDeltaVolume =
            tick.aggressor === "buyer"
                ? tick.volume
                : -tick.volume;

        return {
            bucket,

            totalVolume: tick.notional,
            totalVolumeVolume: tick.volume,

            volumeDelta,
            volumeDeltaVolume,

            bins,

            candle: {
                time: bucket,

                open: tick.value,
                high: tick.value,
                low: tick.value,
                close: tick.value,

                total_volume: tick.notional,
                total_volume_volume: tick.volume,

                volume_delta: volumeDelta,
                volume_delta_volume:
                    volumeDeltaVolume,

                binned_profile: bins,
            },
        };
    }

    finalizeCandle(candle) {
        const profileRows = Object.entries(
            candle.binned_profile || {}
        )
            .map(([price, profile]) => ({
                price: Number(price),

                buy: profile.buy ?? 0,
                sell: profile.sell ?? 0,

                total:
                    (profile.buy ?? 0) +
                    (profile.sell ?? 0),
            }))
            .sort((a, b) => b.price - a.price);

        if (!profileRows.length) {
            candle.footprint = null;
            return candle;
        }

        const totalVolume =
            candle.total_volume ??
            profileRows.reduce(
                (sum, row) => sum + row.total,
                0
            );

        const maxVolume = Math.max(
            ...profileRows.map(row => row.total),
            0
        );

        // POC.
        const pocRow = profileRows.reduce(
            (best, row) =>
                row.total > best.total
                    ? row
                    : best
        );

        const poc = pocRow.price;

        // 70% value area around POC.
        const targetVolume = totalVolume * 0.70;

        const pocIndex = profileRows.findIndex(
            row => row.price === poc
        );

        let higher = pocIndex;
        let lower = pocIndex;

        let running = profileRows[pocIndex].total;

        while (running < targetVolume) {
            const nextLower =
                lower < profileRows.length - 1
                    ? profileRows[lower + 1].total
                    : -1;

            const nextHigher =
                higher > 0
                    ? profileRows[higher - 1].total
                    : -1;

            if (nextHigher >= nextLower) {
                if (higher > 0) {
                    higher--;
                    running +=
                        profileRows[higher].total;
                } else if (
                    lower < profileRows.length - 1
                ) {
                    lower++;
                    running +=
                        profileRows[lower].total;
                } else {
                    break;
                }
            } else {
                if (lower < profileRows.length - 1) {
                    lower++;
                    running +=
                        profileRows[lower].total;
                } else if (higher > 0) {
                    higher--;
                    running +=
                        profileRows[higher].total;
                } else {
                    break;
                }
            }
        }

        candle.footprint = {
            rows: profileRows,

            poc,

            vah: profileRows[higher].price,
            val: profileRows[lower].price,

            totalVolume,
            maxVolume,
        };

        return candle;
    }
}




/*
const TIMEFRAMES = {
    "1min": 60,
    "5min": 300,
    "15min": 900,
    "30min": 1800,
    "1h": 3600,
    "4h": 14400,
};

export class DataFeedPipeline {
    constructor() {
        this.history = {};
    }

    consumeB(rows) {
        const streamKey = "binance|futures trade|BTCUSDT";

        // One independent candle builder per timeframe
        for (const label of Object.keys(TIMEFRAMES)) {
            this.history[label] = {
                cursor: null,
                candles: [],
            };
        }

        for (const row of rows) {
            const price = Number(row.price);
            const volume = Number(row.quantity);
            const time = Number(row.transact_time);

            if (
                !Number.isFinite(price) ||
                !Number.isFinite(volume) ||
                !Number.isFinite(time)
            ) {
                continue;
            }

            const tick = {
                id: row.agg_trade_id,
                time: Math.floor(time / 1000),
                value: price,
                volume,
                notional: price * volume,
                aggressor: row.is_buyer_maker
                    ? "seller"
                    : "buyer",
            };

            for (const [label, seconds] of Object.entries(TIMEFRAMES)) {
                this.updateHistory(
                    label,
                    seconds,
                    tick
                );
            }
        }

        // The final candle never gets closed by another tick,
        // so explicitly emit it.
        for (const label of Object.keys(TIMEFRAMES)) {
            const state = this.history[label];

            if (state.cursor) {
                state.candles.push(state.cursor.candle);
            }

            postMessage({
                type: "setData",
                streamKey,
                timeframe: label,
                data: state.candles,
            });
        }
    }

    updateHistory(label, tfSeconds, tick) {
        const state = this.history[label];

        const bucket =
            Math.floor(tick.time / tfSeconds) * tfSeconds;

        // First candle
        if (!state.cursor) {
            state.cursor = this.newCursor(
                bucket,
                tick
            );
            return;
        }

        // New candle → previous candle is complete
        if (bucket !== state.cursor.bucket) {
            state.candles.push(
                state.cursor.candle
            );

            state.cursor =
                this.newCursor(bucket, tick);

            return;
        }

        const cursor = state.cursor;
        const candle = cursor.candle;

        // OHLC
        if (tick.value > candle.high)
            candle.high = tick.value;

        if (tick.value < candle.low)
            candle.low = tick.value;

        candle.close = tick.value;

        // Volume
        cursor.totalVolume += tick.notional;
        cursor.totalVolumeVolume += tick.volume;

        if (tick.aggressor === "buyer") {
            cursor.volumeDelta += tick.notional;
            cursor.volumeDeltaVolume += tick.volume;
        } else {
            cursor.volumeDelta -= tick.notional;
            cursor.volumeDeltaVolume -= tick.volume;
        }

        candle.total_volume =
            cursor.totalVolume;

        candle.total_volume_volume =
            cursor.totalVolumeVolume;

        candle.volume_delta =
            cursor.volumeDelta;

        candle.volume_delta_volume =
            cursor.volumeDeltaVolume;

        // Footprint
        let level =
            cursor.bins[tick.value];

        if (!level) {
            level = {
                buy: 0,
                sell: 0,
                buy_volume: 0,
                sell_volume: 0,
            };

            cursor.bins[tick.value] = level;
        }

        if (tick.aggressor === "buyer") {
            level.buy += tick.notional;
            level.buy_volume += tick.volume;
        } else {
            level.sell += tick.notional;
            level.sell_volume += tick.volume;
        }

        candle.binned_profile =
            cursor.bins;
    }

    newCursor(bucket, tick) {
        const bins = {};

        bins[tick.value] = {
            buy:
                tick.aggressor === "buyer"
                    ? tick.notional
                    : 0,

            sell:
                tick.aggressor === "seller"
                    ? tick.notional
                    : 0,

            buy_volume:
                tick.aggressor === "buyer"
                    ? tick.volume
                    : 0,

            sell_volume:
                tick.aggressor === "seller"
                    ? tick.volume
                    : 0,
        };

        const volumeDelta =
            tick.aggressor === "buyer"
                ? tick.notional
                : -tick.notional;

        const volumeDeltaVolume =
            tick.aggressor === "buyer"
                ? tick.volume
                : -tick.volume;

        return {
            bucket,

            totalVolume: tick.notional,
            totalVolumeVolume: tick.volume,

            volumeDelta,
            volumeDeltaVolume,

            bins,

            candle: {
                time: bucket,

                open: tick.value,
                high: tick.value,
                low: tick.value,
                close: tick.value,

                total_volume: tick.notional,
                total_volume_volume: tick.volume,

                volume_delta: volumeDelta,
                volume_delta_volume:
                    volumeDeltaVolume,

                binned_profile: bins,
            },
        };
    }
}*/