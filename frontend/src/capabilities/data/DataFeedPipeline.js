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

const FOOTPRINT_REFRESH = {
    "1m": 250,
    "5m": 1250+300,
    "15m": 3750+700,
    "1h": 15000+1500,
    "4h": 36000+1800
};

const pending = new Map();
let timer = null;

function getKey(message) {
    switch (message.type) {
        case "addSymbol":
            return `symbol:${message.symbol}`;

        case "addPlatform":
            return `platform:${message.platform}`;

        case "addTradeType":
            return `tradeType:${message.tradeType}`;

        case "addTimeframe":
            return `timeframe:${message.timeframe}`;

        case "setData":
            return `data:${message.streamKey}|${message.timeframe}`;

        default:
            return null;
    }
}

function getTimestamp(message) {
    if (
        message.type === "setData" &&
        message.data?.length
    ) {
        return message.data[0].time ?? 0;
    }

    return 0;
}

export function workerPost(message) {
    const key = getKey(message);

    // Unknown messages: preserve normally
    if (!key) {
        pending.set(Symbol(), message);
    } else {
        const existing = pending.get(key);

        // setData: keep newest state only
        if (
            message.type === "setData" &&
            existing
        ) {
            const oldTime = getTimestamp(existing);
            const newTime = getTimestamp(message);

            if (newTime <= oldTime) {
                return;
            }
        }

        // all other types naturally dedupe
        pending.set(key, message);
    }

    if (timer) return;

    timer = setTimeout(() => {
        const batch = Array.from(pending.values());

        pending.clear();
        timer = null;

        postMessage(batch);
    }, 5000);
}

export class DataFeedPipeline {
  constructor() {
    this.cursor = {};
    this.consume = this.consume.bind(this);
    this.footprintPending = new Set();
  }

  consume(message) {

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

    workerPost({
        type: "addSymbol",
        symbol: d.s,
    });

    workerPost({
        type: "addPlatform",
        platform: "binance",
    });

    workerPost({
        type: "addTradeType",
        tradeType: "futures trade",
    });

    workerPost({
        type: "addTimeframe",
        timeframe: "tick",
    });
    

    workerPost({type:"setData",streamKey, timeframe:"tick", data: [tick]});

    if (!this.cursor[streamKey]) {
      this.cursor[streamKey] = {};
    }

    for (const [label, seconds] of Object.entries(TIMEFRAMES)) {
      this.update(streamKey, label, seconds, tick);
    }
  }


  prepareFootprint(candle) {

      const profileRows = Object.entries(
        candle.binned_profile || {}
      )
      .map(([price, profile]) => ({
          price: Number(price),
          buy: profile.buy ?? 0,
          sell: profile.sell ?? 0,
          total:
            (profile.buy ?? 0) +
            (profile.sell ?? 0)
      }))
      .sort((a, b) => b.price - a.price);


      const totalVolume =
        candle.total_volume ??
        profileRows.reduce(
          (sum, row) => sum + row.total,
          0
        );


      const maxVolume =
        Math.max(
          ...profileRows.map(
            row => row.total
          ),
          0
        );


      if (!profileRows.length) {
        candle.footprint = null;
        return candle;
      }


      const pocRow =
        profileRows.reduce(
          (best, row) =>
            row.total > best.total
              ? row
              : best
        );

      //console.log(pocRow)
      const poc =
        pocRow.price;


      const targetVolume =
        totalVolume * 0.70;


      const pocIndex =
        profileRows.findIndex(
          row => row.price === poc
        );


      let higher = pocIndex;
      let lower = pocIndex;

      let running =
        profileRows[pocIndex].total;


      while (
        running < targetVolume
      ) {

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
          }

        } else {

          if (lower < profileRows.length - 1) {
            lower++;
            running +=
              profileRows[lower].total;
          }

        }

      }

      //console.log(candle.total_volume_volume,candle.volume_delta_volume)
      candle.footprint = {
        rows: profileRows,

        poc,

        vah:
          profileRows[higher].price,

        val:
          profileRows[lower].price,

        totalVolume,

        maxVolume
      };


      return candle;
    }


  scheduleFootprint(candle, streamKey, label) {
        const key = `${streamKey}|${label}`;
        if (this.footprintPending.has(key)) {
            return;
        }
        const delay =
        FOOTPRINT_REFRESH[label] ?? 5000;

        this.footprintPending.add(key);

        setTimeout(() => {

            this.prepareFootprint(candle);

            this.footprintPending.delete(key);

        }, delay);
    }

  update(streamKey, label, tfSeconds, tick) {

    let cursor = this.cursor[streamKey][label];

    if (!cursor) {
      cursor = this.newCursor(tfSeconds, tick);
      this.cursor[streamKey][label] = cursor;

      workerPost({
          type: "addTimeframe",
          timeframe: label,
      });
      workerPost({
          type: "setData",
          streamKey,
          timeframe: label,
          data: [cursor.candle],
      });
      
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
    this.scheduleFootprint(
        candle,
        streamKey,label
    );

    workerPost({
        type: "setData",
        streamKey,
        timeframe: label,
        data: [candle],
    });
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

