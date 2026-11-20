
class SwingsIdentifier {
    constructor(swingsStore) {
        this.pos = {};
        this.swings = {};
        this.swingsStore = swingsStore;
    }

    removeLatestSwing(key) {
        if (this.swingsStore) {
            this.swingsStore.getState().removeLatestSwing(key);
        } else {
            this.swings[key]?.pop();
        }
    }

    getSwings(key) {
        const swings = this.swingsStore
            ? this.swingsStore.getState().swings
            : this.swings;

        return key === undefined ? swings : swings[key] ?? [];
    }

    addSwings(key, swing) {
        if (this.swingsStore) {
            this.swingsStore.getState().addSwings(key, swing);
        } else {
            if (!this.swings[key]) this.swings[key] = [];
            this.swings[key].push(swing);
        }
    }

    processSwing(key, candle, type, last) {
        const swing = {
            type,
            low: candle.low,
            high: candle.high,
            open: candle.open,
            close: candle.close,
            time: candle.time
        };

        if (!last || last.type !== type) {
            this.addSwings(key, swing);
        } else if (
            type === "high" && last.high < candle.high ||
            type === "low" && last.low > candle.low
        ) {
            this.removeLatestSwing(key);
            this.addSwings(key, swing);
        }
    }

    findSwings(key, data) {
        //console.log("in findwings, pos:",JSON.stringify(this.pos))
        if (data.length < 3) return;

        if (this.pos[key] === undefined) {
            this.pos[key] = 0;
        }

        for (; this.pos[key] < data.length - 2; this.pos[key]++) {

            const candle_one = data[this.pos[key]];
            const candle_two = data[this.pos[key] + 1];
            const candle_three = data[this.pos[key] + 2];

            const last = this.getSwings(key).at(-1);

            const isHigh =
                candle_two.high >= candle_one.high &&
                candle_two.high >= candle_three.high;

            const isLow =
                candle_two.low <= candle_one.low &&
                candle_two.low <= candle_three.low;

            // Both conditions qualify on the same candle.
            if (isHigh && isLow) {

                // Discard dual swing if no previous swing exists.
                if (!last) continue;

                // Alternate against the previous swing.
                const type = last.type === "high" ? "low" : "high";

                this.processSwing(key, candle_two, type, last);

            } else if (isHigh) {

                this.processSwing(key, candle_two, "high", last);

            } else if (isLow) {

                this.processSwing(key, candle_two, "low", last);
            }
          //console.log("new pos:", this.pos[key])
        }
      //
    }
}

export default SwingsIdentifier;
