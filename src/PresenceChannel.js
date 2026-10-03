import { Channel } from './Channel.js';

export class PresenceChannel extends Channel {
  constructor(name, socket) {
    super(name, socket);
    this.members = {};
  }

  bind(event, callback) {
    if (event === 'subscription_succeeded' || event === 'pusher:subscription_succeeded') {
      return super.bind('subscription_succeeded', (data) => {
        this.members = data?.members || {};
        callback(data);
      });
    }

    if (event === 'member_added' || event === 'pusher:member_added') {
      return super.bind('member_added', (data) => {
        if (data?.userId) {
          this.members[data.userId] = data;
        }
        callback(data);
      });
    }

    if (event === 'member_removed' || event === 'pusher:member_removed') {
      return super.bind('member_removed', (data) => {
        if (data?.userId) {
          delete this.members[data.userId];
        }
        callback(data);
      });
    }

    return super.bind(event, callback);
  }

  /** Current members keyed by userId */
  getMembers() {
    return { ...this.members };
  }

  /** Number of members currently in the channel */
  getMemberCount() {
    return Object.keys(this.members).length;
  }
}
