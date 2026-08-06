// DataPipeline.js

// DataFeedPipeline.js
// Live-optimized incremental candle builder.

const TIMEFRAMES = {
  "1min": 60,
  "5min": 300,
  "15min": 900,
  "30min": 1800,
  "1h": 3600,
  "4h": 14400,
};

export class DataFeedPipeline {
  constructor(store) {
    this.store = store;
    this.cursor = {};
    this.consume = this.consume.bind(this);
  }

  consume(message) {
    const state = this.store.getState();

    const parsed =
      typeof message === "string"
        ? JSON.parse(message)
        : message;

    const d = parsed.data;

    const price = +d.p;
    const volume = +d.q;

    const tick = {
      id: d.a,
      time: Math.floor(d.T / 1000),
      value: price,
      volume,
      notional: price * volume,
      aggressor: d.m ? "seller" : "buyer",
    };

    const streamKey = `binance|futures trade|${d.s}`;

    state.addSymbol(d.s);
    state.addPlatform("binance");
    state.addTradeType("futures trade");
    state.addTimeframe("tick");

    state.setData(streamKey, "tick", [tick]);

    if (!this.cursor[streamKey]) {
      this.cursor[streamKey] = {};
    }

    for (const [label, seconds] of Object.entries(TIMEFRAMES)) {
      this.update(streamKey, label, seconds, tick);
    }
  }

  update(streamKey, label, tfSeconds, tick) {
    const state = this.store.getState();

    let cursor = this.cursor[streamKey][label];

    if (!cursor) {
      cursor = this.newCursor(tfSeconds, tick);
      this.cursor[streamKey][label] = cursor;

      state.addTimeframe(label);
      state.setData(streamKey, label, [cursor.candle]);
      return;
    }

    const bucket =
      Math.floor(tick.time / tfSeconds) * tfSeconds;

    // New candle
    if (bucket !== cursor.bucket) {
      cursor.bucket = bucket;

      cursor.totalVolume = 0;
      cursor.totalVolumeVolume = 0;

      cursor.volumeDelta = 0;
      cursor.volumeDeltaVolume = 0;

      cursor.bins = {};

      cursor.candle = {
        time: bucket,
        open: tick.value,
        high: tick.value,
        low: tick.value,
        close: tick.value,

        total_volume: 0,
        total_volume_volume: 0,

        volume_delta: 0,
        volume_delta_volume: 0,

        binned_profile: {},
      };
    }

    const candle = cursor.candle;

    // -----------------
    // OHLC
    // -----------------

    if (tick.value > candle.high) candle.high = tick.value;
    if (tick.value < candle.low) candle.low = tick.value;

    candle.close = tick.value;

    // -----------------
    // Running totals
    // -----------------

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
    candle.volume_delta_volume = cursor.volumeDeltaVolume;

    // -----------------
    // Price-level footprint
    // -----------------

    const price = tick.value;

    let level = cursor.bins[price];

    if (!level) {
      level = {
        buy: 0,
        sell: 0,
        buy_volume: 0,
        sell_volume: 0,
      };

      cursor.bins[price] = level;
    }

    if (tick.aggressor === "buyer") {
      level.buy += tick.notional;
      level.buy_volume += tick.volume;
    } else {
      level.sell += tick.notional;
      level.sell_volume += tick.volume;
    }

    candle.binned_profile = cursor.bins;

    state.setData(streamKey, label, [candle]);
  }

  newCursor(tfSeconds, tick) {
    const bucket =
      Math.floor(tick.time / tfSeconds) * tfSeconds;

    const bins = {};

    bins[tick.value] = {
      buy: tick.aggressor === "buyer" ? tick.notional : 0,
      sell: tick.aggressor === "seller" ? tick.notional : 0,

      buy_volume: tick.aggressor === "buyer" ? tick.volume : 0,
      sell_volume: tick.aggressor === "seller" ? tick.volume : 0,
    };

    return {
      bucket,

      totalVolume: tick.notional,
      totalVolumeVolume: tick.volume,

      volumeDelta:
        tick.aggressor === "buyer"
          ? tick.notional
          : -tick.notional,

      volumeDeltaVolume:
        tick.aggressor === "buyer"
          ? tick.volume
          : -tick.volume,

      bins,

      candle: {
        time: bucket,
        open: tick.value,
        high: tick.value,
        low: tick.value,
        close: tick.value,

        total_volume: tick.notional,
        total_volume_volume: tick.volume,

        volume_delta:
          tick.aggressor === "buyer"
            ? tick.notional
            : -tick.notional,

        volume_delta_volume:
          tick.aggressor === "buyer"
            ? tick.volume
            : -tick.volume,

        binned_profile: bins,
      },
    };
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
  constructor(store) {
    this.store = store;
    this.cursor = {};
    this.consume = this.consume.bind(this);
  }

  consume(message) {
    const state = this.store.getState();

    const parsed =
      typeof message === "string"
        ? JSON.parse(message)
        : message;

    const d = parsed.data;

    const tick = {
      time: Math.floor(d.T / 1000),
      value: +d.p,
      volume: +d.q,
      aggressor: d.m ? "seller" : "buyer",
    };

    const streamKey = `binance|futures trade|${d.s}`;

    state.addSymbol(d.s);
    state.addPlatform("binance");
    state.addTradeType("futures trade");
    state.addTimeframe("tick");

    state.setData(streamKey, "tick", [tick]);

    if (!this.cursor[streamKey]) {
      this.cursor[streamKey] = {};
    }

    for (const [label, seconds] of Object.entries(TIMEFRAMES)) {
      this.update(streamKey, label, seconds, tick);
    }
  }

  update(streamKey, label, tfSeconds, tick) {
    const state = this.store.getState();

    let cursor = this.cursor[streamKey][label];

    if (!cursor) {
      cursor = this.newCursor(tfSeconds, tick);
      this.cursor[streamKey][label] = cursor;

      state.addTimeframe(label);
      state.setData(streamKey, label, [cursor.candle]);
      return;
    }

    const bucket =
      Math.floor(tick.time / tfSeconds) * tfSeconds;

    // New candle
    if (bucket !== cursor.bucket) {
      cursor.bucket = bucket;

      cursor.totalVolume = 0;
      cursor.volumeDelta = 0;
      cursor.bins = {};

      cursor.candle = {
        time: bucket,
        open: tick.value,
        high: tick.value,
        low: tick.value,
        close: tick.value,
        total_volume: 0,
        volume_delta: 0,
        binned_profile: {},
      };
    }

    const candle = cursor.candle;

    // OHLC
    if (tick.value > candle.high) candle.high = tick.value;
    if (tick.value < candle.low) candle.low = tick.value;
    candle.close = tick.value;

    // Running totals
    cursor.totalVolume += tick.volume;

    if (tick.aggressor === "buyer") {
      cursor.volumeDelta += tick.volume;
    } else {
      cursor.volumeDelta -= tick.volume;
    }

    candle.total_volume = cursor.totalVolume;
    candle.volume_delta = cursor.volumeDelta;

    // -------------------------
    // Price-level footprint
    // -------------------------

    const price = tick.value;

    let level = cursor.bins[price];

    if (!level) {
      level = {
        buy: 0,
        sell: 0,
      };

      cursor.bins[price] = level;
    }

    if (tick.aggressor === "buyer") {
      level.buy += tick.volume;
    } else {
      level.sell += tick.volume;
    }

    candle.binned_profile = cursor.bins;

    state.setData(streamKey, label, [candle]);
  }

  newCursor(tfSeconds, tick) {
    const bucket =
      Math.floor(tick.time / tfSeconds) * tfSeconds;

    const bins = {};

    bins[tick.value] = {
      buy: tick.aggressor === "buyer" ? tick.volume : 0,
      sell: tick.aggressor === "seller" ? tick.volume : 0,
    };

    return {
      bucket,

      totalVolume: tick.volume,

      volumeDelta:
        tick.aggressor === "buyer"
          ? tick.volume
          : -tick.volume,

      bins,

      candle: {
        time: bucket,
        open: tick.value,
        high: tick.value,
        low: tick.value,
        close: tick.value,

        total_volume: tick.volume,

        volume_delta:
          tick.aggressor === "buyer"
            ? tick.volume
            : -tick.volume,

        binned_profile: bins,
      },
    };
  }
}




export class DataFeedPipeline {
  constructor(store) {
    this.store = store;
    this.consume = this.consume.bind(this);
  }

  consume(message) {
    const state = this.store.getState();
    const parsed = typeof message === "string" ? JSON.parse(message) : message
    const parsed_data = parsed.data;
    const symbol = parsed_data.s
    //console.log(symbol)
    const platform = "binance"
    const tradeType = "futures trade"

    const aggressor = parsed_data["m"] ? "seller" : "buyer"
    const quantity = parseFloat(parsed_data["q"])
    const value = parseFloat(parsed_data["p"])
    // ms -> seconds
    const time = Math.floor(parsed_data["T"] / 1000)

    const streamkey = `${platform}|${tradeType}|${symbol}`
    state.addSymbol(symbol);
    state.addPlatform(platform);
    state.addTradeType(tradeType);
    state.addTimeframe("tick")
    state.setData(streamkey,"tick",
      [{"time":time, "value":value, "volume":quantity, "aggressor":aggressor}])

    this.buildCandles(streamkey, 60)
    this.buildCandles(streamkey, 300)

  }

  buildCandles(streamKey, tfSeconds) {
    const state = this.store.getState();

    const ticks = state.data?.[streamKey]?.tick.data;

    if (!ticks || ticks.length === 0) return;

    const candles = [];

    let current = null;
    let candleTicks = [];

    const finalizeCandle = () => {
        if (!current) return;

        const range = current.high - current.low;
        const binSize = range === 0 ? 1 : range / 10;

        const binned_profile = {};

        // Initialize bins
        for (let i = 0; i < 10; i++) {
            const binOpen = current.low + i * binSize;

            binned_profile[binOpen] = {
                buy: 0,
                sell: 0,
            };
        }

        let total_volume = 0;
        let volume_delta = 0;

        for (const tick of candleTicks) {
            total_volume += tick.volume;

            if (tick.aggressor === "buyer") {
                volume_delta += tick.volume;
            } else {
                volume_delta -= tick.volume;
            }

            let index;

            if (range === 0) {
                index = 0;
            } else {
                index = Math.floor((tick.value - current.low) / binSize);

                if (index > 9) index = 9;
                if (index < 0) index = 0;
            }

            const binOpen = current.low + index * binSize;

            if (tick.aggressor === "buyer") {
                binned_profile[binOpen].buy += tick.volume;
            } else {
                binned_profile[binOpen].sell += tick.volume;
            }
        }

        current.total_volume = total_volume;
        current.volume_delta = volume_delta;
        current.binned_profile = binned_profile;

        candles.push(current);
    };

    for (const tick of ticks) {
        const bucket = Math.floor(tick.time / tfSeconds) * tfSeconds;

        if (!current || current.time !== bucket) {

            finalizeCandle();

            current = {
                time: bucket,
                open: tick.value,
                high: tick.value,
                low: tick.value,
                close: tick.value,
            };

            candleTicks = [tick];
            continue;
        }

        current.high = Math.max(current.high, tick.value);
        current.low = Math.min(current.low, tick.value);
        current.close = tick.value;

        candleTicks.push(tick);
    }

    finalizeCandle();

    state.addTimeframe(tfSeconds);

    state.setData(
        streamKey,
        tfSeconds,
        candles
    );
}
}*/