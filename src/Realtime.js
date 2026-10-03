import { io } from 'socket.io-client';
import { Channel } from './Channel.js';
import { PresenceChannel } from './PresenceChannel.js';

/**
 * Pusher-style Realtime client
 *
 * @example
 * const realtime = new Realtime({
 *   host: 'https://messaging.yourdomain.com',
 *   auth: { token: userJwt }
 * });
 *
 * const channel = realtime.subscribe('orders.123');
 * channel.bind('status-updated', (data) => console.log(data));
 */
export class Realtime {
  /**
   * @param {object} options
   * @param {string} options.host - Full URL of your messaging service (e.g. https://msg.example.com)
   * @param {object} [options.auth] - Authentication
   * @param {string} [options.auth.token] - JWT containing userId + appId
   * @param {boolean} [options.autoConnect=true]
   */
  constructor(options = {}) {
    if (!options.host) {
      throw new Error('Realtime: "host" is required (e.g. https://messaging.yourdomain.com)');
    }

    this.options = options;
    this.channels = {};

    this.socket = io(options.host, {
      auth: options.auth || {},
      autoConnect: options.autoConnect !== false,
      transports: ['websocket', 'polling']
    });

    // Re-join channels after reconnect
    this.socket.on('connect', () => {
      for (const name of Object.keys(this.channels)) {
        this.socket.emit('join', name);
      }
    });
  }

  /**
   * Subscribe to a channel
   * @param {string} channelName
   * @returns {Channel|PresenceChannel}
   */
  subscribe(channelName) {
    if (this.channels[channelName]) {
      return this.channels[channelName];
    }

    this.socket.emit('join', channelName);

    const channel = channelName.startsWith('presence-')
      ? new PresenceChannel(channelName, this.socket)
      : new Channel(channelName, this.socket);

    this.channels[channelName] = channel;
    return channel;
  }

  /**
   * Unsubscribe from a channel
   * @param {string} channelName
   */
  unsubscribe(channelName) {
    if (!this.channels[channelName]) return;

    this.socket.emit('leave', channelName);
    this.channels[channelName].destroy();
    delete this.channels[channelName];
  }

  /**
   * Disconnect from the service
   */
  disconnect() {
    for (const name of Object.keys(this.channels)) {
      this.unsubscribe(name);
    }
    this.socket.disconnect();
  }

  /** Whether the socket is currently connected */
  get connected() {
    return this.socket.connected;
  }

  /** Access the underlying socket if needed */
  get connection() {
    return this.socket;
  }
}
