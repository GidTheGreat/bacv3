// histFeedPipeline.test.js

import { describe, test, expect, beforeEach } from "vitest";
import { DataFeedPipeline } from "./histFeedPipeline";

globalThis.postMessage = () => {};

describe("DataFeedPipeline", () => {
    let pipeline;

    beforeEach(() => {
        pipeline = new DataFeedPipeline();
    });

    test("builds candles from historical ticks", () => {
        pipeline.consumeB([
            {
                price: "100",
                quantity: "2",
                transact_time: 3600000,
                is_buyer_maker: false,
            },
            {
                price: "105",
                quantity: "3",
                transact_time: 3601000,
                is_buyer_maker: true,
            },
        ]);

        const candle = pipeline.history["1h"].candles[0];

        expect(candle.time).toBe(3600);
        expect(candle.open).toBe(100);
        expect(candle.high).toBe(105);
        expect(candle.low).toBe(100);
        expect(candle.close).toBe(105);

        expect(candle.total_volume).toBe(515);
        expect(candle.total_volume_volume).toBe(5);

        expect(candle.volume_delta).toBe(-115);
        expect(candle.volume_delta_volume).toBe(-1);
    });

    test("creates a new candle when timeframe bucket changes", () => {
        pipeline.consumeB([
            {
                price: "100",
                quantity: "1",
                transact_time: 3600000,
                is_buyer_maker: false,
            },
            {
                price: "110",
                quantity: "2",
                transact_time: 7200000,
                is_buyer_maker: false,
            },
        ]);

        const candles = pipeline.history["1h"].candles;

        expect(candles).toHaveLength(2);

        expect(candles[0].time).toBe(3600);
        expect(candles[0].open).toBe(100);
        expect(candles[0].high).toBe(100);
        expect(candles[0].low).toBe(100);
        expect(candles[0].close).toBe(100);

        expect(candles[1].time).toBe(7200);
        expect(candles[1].open).toBe(110);
        expect(candles[1].high).toBe(110);
        expect(candles[1].low).toBe(110);
        expect(candles[1].close).toBe(110);
    });

    test("calculates buyer and seller volume delta", () => {
        pipeline.consumeB([
            {
                price: "100",
                quantity: "2",
                transact_time: 3600000,
                is_buyer_maker: false,
            },
            {
                price: "100",
                quantity: "1",
                transact_time: 3601000,
                is_buyer_maker: true,
            },
        ]);

        const candle = pipeline.history["1h"].candles[0];

        expect(candle.total_volume).toBe(300);
        expect(candle.total_volume_volume).toBe(3);

        expect(candle.volume_delta).toBe(100);
        expect(candle.volume_delta_volume).toBe(1);
    });

    test("builds price-level footprint", () => {
        pipeline.consumeB([
            {
                price: "100",
                quantity: "2",
                transact_time: 3600000,
                is_buyer_maker: false,
            },
            {
                price: "100",
                quantity: "1",
                transact_time: 3601000,
                is_buyer_maker: true,
            },
            {
                price: "105",
                quantity: "3",
                transact_time: 3602000,
                is_buyer_maker: true,
            },
        ]);

        const candle = pipeline.history["1h"].candles[0];

        expect(candle.binned_profile[100]).toEqual({
            buy: 200,
            sell: 100,
            buy_volume: 2,
            sell_volume: 1,
        });

        expect(candle.binned_profile[105]).toEqual({
            buy: 0,
            sell: 315,
            buy_volume: 0,
            sell_volume: 3,
        });
    });

    test("calculates footprint POC and volume statistics", () => {
        const candle = {
            total_volume: 1000,

            binned_profile: {
                100: {
                    buy: 100,
                    sell: 100,
                },
                101: {
                    buy: 150,
                    sell: 50,
                },
                102: {
                    buy: 50,
                    sell: 50,
                },
                103: {
                    buy: 25,
                    sell: 25,
                },
            },
        };

        pipeline.finalizeCandle(candle);

        expect(candle.footprint.poc).toBe(101);
        expect(candle.footprint.totalVolume).toBe(1000);
        expect(candle.footprint.maxVolume).toBe(200);

        expect(candle.footprint.rows).toEqual([
            {
                price: 103,
                buy: 25,
                sell: 25,
                total: 50,
            },
            {
                price: 102,
                buy: 50,
                sell: 50,
                total: 100,
            },
            {
                price: 101,
                buy: 150,
                sell: 50,
                total: 200,
            },
            {
                price: 100,
                buy: 100,
                sell: 100,
                total: 200,
            },
        ]);
    });

    test("skips invalid historical rows", () => {
        pipeline.consumeB([
            {
                price: "invalid",
                quantity: "2",
                transact_time: 3600000,
                is_buyer_maker: false,
            },
            {
                price: "100",
                quantity: "2",
                transact_time: 3601000,
                is_buyer_maker: false,
            },
        ]);

        const candle = pipeline.history["1h"].candles[0];

        expect(candle.open).toBe(100);
        expect(candle.high).toBe(100);
        expect(candle.low).toBe(100);
        expect(candle.close).toBe(100);

        expect(candle.total_volume).toBe(200);
        expect(candle.total_volume_volume).toBe(2);
    });

    test("builds 4h candles", () => {
        pipeline.consumeB([
            {
                price: "100",
                quantity: "1",
                transact_time: 14400000,
                is_buyer_maker: false,
            },
            {
                price: "120",
                quantity: "1",
                transact_time: 15000000,
                is_buyer_maker: false,
            },
        ]);

        const candle = pipeline.history["4h"].candles[0];

        expect(candle.time).toBe(14400);
        expect(candle.open).toBe(100);
        expect(candle.high).toBe(120);
        expect(candle.low).toBe(100);
        expect(candle.close).toBe(120);

        expect(candle.total_volume).toBe(220);
        expect(candle.total_volume_volume).toBe(2);
    });
});