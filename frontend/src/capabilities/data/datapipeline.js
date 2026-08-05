// DataPipeline.js

export default class DataPipeline {
  constructor(store) {
    this.store = store;

    this.transport = null;
    this.unsubscribe = null;
  }

  start(transport) {
    this.transport = transport;

    console.log("[Pipeline] Started");

    // Listen for store changes
    this.unsubscribe = this.store.subscribe(
      (state) => state.selection,
      (selection) => {
        this.onSelectionChanged(selection);
      }
    );
  }

  stop() {
    console.log("[Pipeline] Stopped");

    this.unsubscribe?.();
    this.unsubscribe = null;
    this.transport = null;
  }

  // --------------------------------------------------
  // Incoming
  // --------------------------------------------------

  receive(message) {
    console.log("[Pipeline] RX", message);

    switch (message.type) {
      case "snapshot":
        this.handleSnapshot(message);
        break;

      case "update":
        this.handleUpdate(message);
        break;

      case "error":
        this.handleError(message);
        break;

      default:
        console.log("[Pipeline] Unknown message", message);
    }
  }

  // --------------------------------------------------
  // Outgoing
  // --------------------------------------------------

  send(message) {
    this.transport?.send(message);
  }

  // --------------------------------------------------
  // Store events
  // --------------------------------------------------

  onSelectionChanged(selection) {
    console.log("[Pipeline] Selection changed", selection);

    this.send({
      type: "selection",
      payload: selection,
    });
  }

  // --------------------------------------------------
  // Message handlers
  // --------------------------------------------------

  handleSnapshot(message) {
    console.log("[Pipeline] Snapshot");

    // this.store.setState(...)
  }

  handleUpdate(message) {
    console.log("[Pipeline] Update");

    // merge
    // append
    // invalidate cache
    // etc...
  }

  handleError(message) {
    console.log("[Pipeline] Server error", message);
  }
}