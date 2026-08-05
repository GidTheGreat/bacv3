import { useEffect } from "react";
import { LineSeries, CandlestickSeries } from "lightweight-charts";
import { FootprintSeries } from "../volume";

export default function useChartSeries({
    chartRef,
    renderState,
    selection,
    key,
}) {

    useEffect(() => {

        const chart = chartRef.current;
        if (!chart) return;

        const state = renderState.current;

        // Remove existing series
        for (const series of Object.values(state.series)) {
            if (!series) continue;
            chart.removeSeries(series);
        }

        // Reset render state
        state.series = {};
        state.lastTime = undefined;

        // Create new series
        if (selection.timeframe === "tick") {

            state.series.area = chart.addSeries(LineSeries, {
                color: "#2962FF",
            });

        } else {

            if (selection.candle === "volume footprint") {

                state.series.candle = chart.addCustomSeries(
                    new FootprintSeries()
                );

            } else {

                state.series.candle = chart.addSeries(
                    CandlestickSeries,
                    {
                        upColor: "#26a69a",
                        downColor: "#ef5350",
                        borderVisible: false,
                        wickUpColor: "#26a69a",
                        wickDownColor: "#ef5350",
                    }
                );

            }

        }

        state.seenLength[key] = 0;

    }, [
        chartRef,
        key,
        selection.timeframe,
        selection.candle,
    ]);

}