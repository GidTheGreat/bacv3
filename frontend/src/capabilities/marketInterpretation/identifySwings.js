//xyzd
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

    findSwings(key, data) {
        if (data.length < 3) return;

        if (this.pos[key] === undefined) {
            this.pos[key] = 0;
        }

        for (; this.pos[key] < data.length - 2; this.pos[key]++) {

            const candle_one = data[this.pos[key]];
            const candle_two = data[this.pos[key] + 1];
            const candle_three = data[this.pos[key] + 2];

            const last = this.getSwings(key).at(-1);

            if (
                candle_two.high > candle_one.high &&
                candle_two.high > candle_three.high
            ) {
                //console.log(candle_two)
                if (!last || last.type === "low") {
                    this.addSwings(key, {
                        type: "high",
                        low:candle_two.low,
                      high:candle_two.high,
                      open:candle_two.open,
                      close: candle_two.close,
                      time: candle_two.time
                    });
                } else if (last.high < candle_two.high) {
                    this.removeLatestSwing(key);

                    this.addSwings(key, {
                        type: "high",
                        low:candle_two.low,
                      high:candle_two.high,
                      open:candle_two.open,
                      close: candle_two.close,
                      time: candle_two.time
                    
                    });
                }

            } else if (
                candle_two.low < candle_one.low &&
                candle_two.low < candle_three.low
            ) {
               //console.log(candle_two)
                if (!last || last.type === "high") {
                    this.addSwings(key, {
                        type: "low",
                        low:candle_two.low,
                      high:candle_two.high,
                      open:candle_two.open,
                      close: candle_two.close,
                      time: candle_two.time
                    
                    });
                } else if (last.low > candle_two.low) {
                    this.removeLatestSwing(key);

                    this.addSwings(key, {
                        type: "low",
                        low:candle_two.low,
                      high:candle_two.high,
                      open:candle_two.open,
                      close: candle_two.close,
                      time: candle_two.time
                    
                    });
                }
            }
        }
    }
}

export default SwingsIdentifier;