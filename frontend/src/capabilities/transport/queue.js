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

export function scheduleConsumer(queue, consume) {
  if (scheduled) return;

  scheduled = true;

  requestAnimationFrame(() => {
    scheduled = false;

    // Optional time budget (ms)
    const start = performance.now();
    const budget = 4;

    while (
      !queue.isEmpty() &&
      performance.now() - start < budget
    ) {
      consume(queue.dequeue());
    }

    // Continue next frame if backlog remains
    if (!queue.isEmpty()) {
      scheduleConsumer(queue, consume);
    }
  });
}

