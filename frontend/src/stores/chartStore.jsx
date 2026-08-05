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

  setData: (k1, k2, value) =>
    set((state) => ({
      data: {
        ...state.data,
        [k1]: {
          ...state.data[k1],
          [k2]: {
            data: value
          }
        }
      }
    }))
}));

export default useChartStore;