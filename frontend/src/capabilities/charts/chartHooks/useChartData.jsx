import { useEffect, useRef } from "react";

const defaultReplay = {
    cursor: 0,
    playing: false,
    speed: 1,
};

// -------------------------------------------------------------
// Tick dedupe with boundary detection
// -------------------------------------------------------------
function createTickDeduper() {

    let first = null;
    let last = null;
    let count = 0;

    let map = new Map();


    function rebuild(ticks) {

        map.clear();

        for (const tick of ticks) {
            map.set(tick.time, tick);
        }

        first = ticks[0]?.time ?? null;
        last = ticks[ticks.length - 1]?.time ?? null;
        count = ticks.length;

        return [...map.values()];
    }


    return function dedupe(ticks) {

        if (!ticks?.length) {
            return [];
        }


        const newFirst = ticks[0].time;
        const newLast = ticks[ticks.length - 1].time;


        // first load
        if (first === null) {
            return rebuild(ticks);
        }


        /*
            Normal stream update.

            Same first timestamp means the window
            has not moved backwards.

            Only update the map.
        */
        if (
            newFirst === first &&
            newLast >= last
        ) {

            for (const tick of ticks) {
                map.set(tick.time, tick);
            }


            last = newLast;
            count = map.size;


            return [...map.values()];
        }


        /*
            Historical prepend,
            reset,
            replay jump,
            or unknown dataset movement.

            Expensive path.
        */
        return rebuild(ticks);

    };

}


// -------------------------------------------------------------
// Existing render helper
// -------------------------------------------------------------
function getRenderableData(dataset, timeframe, tickDeduper) {

    if (timeframe !== "tick") {
        return dataset.data;
    }


    return tickDeduper.current(dataset.data);

}



export default function useChartData({
    dataset,
    renderState,
    replayState,
    setReplayState,
    selection,
    masterDataset
}) {

    const replayTimer = useRef(null);
    // persistent tick deduper
    const tickDeduper = useRef(
        createTickDeduper()
    );

    const k1 = selection
        ? `${selection.platform}|${selection.trade}|${selection.symbol}`
        : null;

    const replay = k1
        ? (replayState.streams[k1] ?? defaultReplay)
        : defaultReplay;

    // reset dedupe when symbol/stream changes
    useEffect(() => {

        tickDeduper.current = createTickDeduper();

    }, [
        k1
    ]);

    function updateReplay(updater) {

        if (!k1) return;

        setReplayState(prev => ({

            ...prev,

            streams: {

                ...prev.streams,

                [k1]: updater(
                    prev.streams[k1] ?? defaultReplay
                ),

            },

        }));

    }

    // -------------------------------------------------------------
    // Synchronize chart
    // -------------------------------------------------------------
    useEffect(() => {

        if (!dataset?.data?.length) return;

        const state = renderState.current;

        const series = Object.values(state.series).filter(Boolean);

        if (!series.length) return;
        const renderData = getRenderableData(
            dataset,
            selection.timeframe,
            tickDeduper
        );

        if (replayState.replayBar) {

            syncReplay(
                series,
                renderData,
                replay,
                selection.timeframe
            );

            return;

        }

        switch (dataset.mode) {

            case "append":

                syncAppend(series, state, renderData);
                break;

            case "replace":
            case "prepend":
            case "merge":
            case "reset":

                syncReplace(series, state, renderData);
                break;

            default:

                syncReplace(series, state, renderData);

        }

    }, [

        dataset?.revision,

        selection.timeframe,
        selection.candle,

        replayState.replayBar,

        replay.cursor,

    ]);

    // -------------------------------------------------------------
    // Replay playback
    // -------------------------------------------------------------
    useEffect(() => {

        clearTimeout(replayTimer.current);

        if (!replayState.replayBar) return;

        if (!replay.playing) return;

        if (!dataset?.data?.length) return;

        const maxCursor = masterDataset[k1]["1min"].data.length - 1;;

        if (replay.cursor >= maxCursor) {

            updateReplay(s => ({

                ...s,

                cursor: maxCursor,

                playing: false,

            }));

            return;

        }

        replayTimer.current = setTimeout(() => {

            updateReplay(s => ({

                ...s,

                cursor: Math.min(
                    s.cursor + 1,
                    maxCursor
                ),

            }));

        }, 1000 / replay.speed);

        return () =>
            clearTimeout(replayTimer.current);

    }, [

        replayState.replayBar,

        replay.playing,

        replay.cursor,

        replay.speed,

        dataset?.revision,

    ]);

    useEffect(() => {

        return () =>
            clearTimeout(replayTimer.current);

    }, []);

}

// -------------------------------------------------------------
// Normal full replacement
// -------------------------------------------------------------

function syncReplace(seriesList, state, data) {

    for (const series of seriesList) {

        series.setData(data);

    }

    state.lastTime = data.at(-1)?.time;

}

// -------------------------------------------------------------
// Live append
// -------------------------------------------------------------

function syncAppend(seriesList, state, data) {

    const lastTime = state.lastTime;

    const updates =
        lastTime == null
            ? data
            : data.filter(
                bar => bar.time > lastTime
            );

    if (!updates.length) return;

    for (const series of seriesList) {

        for (const bar of updates) {

            series.update(bar);

        }

    }

    state.lastTime = updates.at(-1).time;

}

// -------------------------------------------------------------
// Replay
// -------------------------------------------------------------

function syncReplay(
    seriesList,
    chartData,
    replay,
    timeframe,
) {

    let divisor = 1;

    if (timeframe === "tick") {

        divisor = 0.1;           // replay.cursor * 10

    } else if (timeframe.endsWith("min")) {

        divisor = parseInt(timeframe);

    } else if (timeframe.endsWith("h")) {

        divisor = parseInt(timeframe) * 60;

    }

    const maxCursor = chartData.length - 1;

    const logicalCursor =
        timeframe === "tick"
            ? Math.floor(replay.cursor / divisor)
            : Math.floor(replay.cursor / divisor);

    const cursor = Math.max(
        0,
        Math.min(logicalCursor, maxCursor)
    );

    const replayData = chartData.slice(0, cursor + 1);

    for (const series of seriesList) {
        series.setData(replayData);
    }

}