/**
 * Server-side helper (Pusher-style)
 *
 * @example
 * import { Realtime } from '@your-org/realtime/server';
 *
 * const realtime = new Realtime({
 *   host: 'https://messaging.yourdomain.com',
 *   token: process.env.MESSAGING_JWT
 * });
 *
 * await realtime.trigger('orders.123', 'status-updated', { status: 'ready' });
 */

export class Realtime {
  /**
   * @param {object} options
   * @param {string} options.host - Messaging service URL
   * @param {string} options.token - JWT (must contain userId + appId)
   * @param {string} [options.appId] - Optional override (normally taken from token)
   */
  constructor(options = {}) {
    if (!options.host) throw new Error('Realtime (server): "host" is required');
    if (!options.token) throw new Error('Realtime (server): "token" is required');

    this.host = options.host.replace(/\/$/, '');
    this.token = options.token;
    this.appId = options.appId;
  }

  /**
   * Trigger an event on a channel (same signature as Pusher)
   * @param {string} channel - Channel name
   * @param {string} event - Event name
   * @param {any} data - Payload
   * @returns {Promise<object>}
   */
  async trigger(channel, event, data) {
    if (!channel || !event) {
      throw new Error('trigger(channel, event, data) requires channel and event');
    }

    const body = {
      room: channel,
      event,
      data
    };

    if (this.appId) {
      body.appId = this.appId;
    }

    const response = await fetch(`${this.host}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Publish failed (${response.status})`);
    }

    return response.json();
  }
}

// Also export a simple function style if preferred
export async function trigger({ host, token, appId, channel, event, data }) {
  const client = new Realtime({ host, token, appId });
  return client.trigger(channel, event, data);
}
