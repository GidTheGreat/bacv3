// DataPipeline.js

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
}