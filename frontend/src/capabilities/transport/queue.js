// Queue.js

export  class Queue {
  constructor(initialCapacity = 1024) {
    this.buffer = new Array(initialCapacity);

    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  enqueue(item) {
    if (this.size === this.buffer.length) {
      this.#grow();
    }

    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.buffer.length;
    this.size++;
  }

  dequeue() {
    if (this.size === 0) return undefined;

    const item = this.buffer[this.head];

    // Help GC
    this.buffer[this.head] = undefined;

    this.head = (this.head + 1) % this.buffer.length;
    this.size--;

    return item;
  }

  peek() {
    return this.size === 0
      ? undefined
      : this.buffer[this.head];
  }

  clear() {
    this.buffer.fill(undefined);

    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  isEmpty() {
    return this.size === 0;
  }

  get length() {
    return this.size;
  }

  #grow() {
    const newBuffer = new Array(this.buffer.length * 2);

    for (let i = 0; i < this.size; i++) {
      newBuffer[i] =
        this.buffer[(this.head + i) % this.buffer.length];
    }

    this.buffer = newBuffer;
    this.head = 0;
    this.tail = this.size;
  }
}

let scheduled = false;

export function scheduleConsumer(queue,
  addSymbol,addPlatform,addTf,addTradeType,setData,store) {
    if (scheduled) return;

    scheduled = true;

    requestAnimationFrame(() => {
        scheduled = false;

        while (!queue.isEmpty()) {
            const message = queue.dequeue();
            //console.log(message)
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
            addSymbol(symbol);
            addPlatform(platform);
            addTradeType(tradeType);
            addTf("tick")
            setData(streamkey,"tick",
              [{"time":time, "value":value, "volume":quantity, "aggressor":aggressor}])

            //console.log(store.getState().data)
        }

        if (!queue.isEmpty()) {
            scheduleConsumer();
        }
    });
}

function parser(data){

}