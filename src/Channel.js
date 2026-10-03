export class Channel {
  constructor(name, socket) {
    this.name = name;
    this.socket = socket;
    this.handlers = {};
    this._listening = false;
  }

  /**
   * Bind a callback to an event (Pusher-style)
   * @param {string} event
   * @param {Function} callback
   */
  bind(event, callback) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(callback);

    if (!this._listening) {
      this._listening = true;
      this.socket.on('message', this._onMessage);
    }

    return this;
  }

  /**
   * Remove callback(s) for an event
   * @param {string} event
   * @param {Function} [callback] - if omitted, removes all handlers for the event
   */
  unbind(event, callback) {
    if (!this.handlers[event]) return this;

    if (callback) {
      this.handlers[event] = this.handlers[event].filter(cb => cb !== callback);
    } else {
      delete this.handlers[event];
    }
    return this;
  }

  /**
   * Trigger a client event on this channel
   * @param {string} event
   * @param {any} data
   */
  trigger(event, data) {
    this.socket.emit('message', {
      room: this.name,
      event,
      data
    });
    return this;
  }

  // Internal
  _onMessage = (msg) => {
    if (msg.room !== this.name) return;

    const event = msg.event || 'message';
    const callbacks = this.handlers[event] || [];

    for (const cb of callbacks) {
      try {
        cb(msg.data, msg);
      } catch (err) {
        console.error(`[Realtime] Error in "${event}" handler:`, err);
      }
    }
  };

  destroy() {
    this.socket.off('message', this._onMessage);
    this.handlers = {};
    this._listening = false;
  }
}
