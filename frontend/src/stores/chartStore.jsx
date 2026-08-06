import { create } from 'zustand'

const useChartStore = create((set) => ({
  selection: {
    default: {
      symbol: "BTCUSDT",
      platform: "binance",
      trade: "futures trade",
      timeframe: "tick",
      candle: "japanese"
    }
  },

  createChart: (chartId) =>
  set((state) => ({
    selection: {
      ...state.selection,
      [chartId]: {
        ...state.selection.default,
      },
    },
  })),

  destroyChart: (chartId) =>
  set((state) => {
    const selection = { ...state.selection };
    delete selection[chartId];
    return { selection };
  }),

  symbols: ["BTCUSDT"],
  timeframes: ["tick"],
  platforms: ["binance"],
  trade_types: ["futures trade"],
  candle_types: ["japanese", "volume footprint"],

  // symbols
  addSymbol: (symbol) =>
    set((state) => ({
      symbols: state.symbols.includes(symbol)
        ? state.symbols
        : [...state.symbols, symbol]
    })),

  removeSymbol: (symbol) =>
    set((state) => ({
      symbols: state.symbols.filter((s) => s !== symbol)
    })),

  // timeframes
  addTimeframe: (tf) =>
    set((state) => ({
      timeframes: state.timeframes.includes(tf)
        ? state.timeframes
        : [...state.timeframes, tf]
    })),

  removeTimeframe: (tf) =>
    set((state) => ({
      timeframes: state.timeframes.filter((t) => t !== tf)
    })),

  // platforms
  addPlatform: (p) =>
    set((state) => ({
      platforms: state.platforms.includes(p)
        ? state.platforms
        : [...state.platforms, p]
    })),

  removePlatform: (p) =>
    set((state) => ({
      platforms: state.platforms.filter((x) => x !== p)
    })),

  // trade types
  addTradeType: (t) =>
    set((state) => ({
      trade_types: state.trade_types.includes(t)
        ? state.trade_types
        : [...state.trade_types, t]
    })),

  removeTradeType: (t) =>
    set((state) => ({
      trade_types: state.trade_types.filter((x) => x !== t)
    })),

  data: {},

  modifySelection: (chartId, patch) =>
  set((state) => ({
    selection: {
      ...state.selection,
      [chartId]: {
        ...(state.selection[chartId] ?? {
          symbol: "BTCUSDT",
          platform: "binance",
          trade: "futures trade",
          timeframe: "tick",
        }),
        ...patch,
      },
    },
  })),

  setData: (k1, k2, incoming) =>
  set((state) => {
    const current = state.data[k1]?.[k2];

    const existing = current?.data ?? [];
    const revision = (current?.revision ?? 0) + 1;

    // First load
    if (existing.length === 0 || incoming.length === 0) {
      return {
        data: {
          ...state.data,
          [k1]: {
            ...state.data[k1],
            [k2]: {
              data: incoming,
              mode: "replace",
              revision,
            },
          },
        },
      };
    }


    /*
      FAST PATH
      ----------
      Live candle updates:
      incoming contains only the current forming candle.

      Replace existing candle with same timestamp.
      Avoid Map + sort over entire dataset.
    */

    if (
      k2 !== "tick" &&
      incoming.length === 1
    ) {
      const update = incoming[0];

      const index =
        existing.findIndex(
          item => item.time === update.time
        );

      if (index !== -1) {
        const merged = [...existing];

        merged[index] = update;

        return {
          data: {
            ...state.data,
            [k1]: {
              ...state.data[k1],
              [k2]: {
                data: merged,
                mode: "replace",
                revision,
              },
            },
          },
        };
      }
    }


    const oldFirst = existing[0].time;
    const oldLast =
      existing[existing.length - 1].time;

    const newFirst = incoming[0].time;
    const newLast =
      incoming[incoming.length - 1].time;


    let merged;
    let mode;


    // Pure append
    if (newFirst > oldLast) {

      merged = [
        ...existing,
        ...incoming,
      ];

      mode = "append";

    }

    // Pure prepend
    else if (newLast < oldFirst) {

      merged = [
        ...incoming,
        ...existing,
      ];

      mode = "prepend";

    }

    // Anything overlapping
    else {

      const map = new Map();

      const key = (item) =>
        k2 === "tick"
          ? item.id
          : item.time;


      existing.forEach(item =>
        map.set(
          key(item),
          item
        )
      );


      incoming.forEach(item =>
        map.set(
          key(item),
          item
        )
      );


      merged = [
        ...map.values()
      ].sort((a, b) => {

        if (a.time !== b.time) {
          return a.time - b.time;
        }

        if (k2 === "tick") {
          return a.id - b.id;
        }

        return 0;
      });


      mode = "merge";
    }


    return {
      data: {
        ...state.data,
        [k1]: {
          ...state.data[k1],
          [k2]: {
            data: merged,
            mode,
            revision,
          },
        },
      },
    };
  }),
}));


export default useChartStore;