# @yoweli/realtime

Pusher-style real-time client for the Realtime Messaging Service.

## Install

```bash
npm install @yoweli/realtime
```

## Frontend (Browser / React / Vue / etc.)

```js
import { Realtime } from '@yoweli/realtime';

// 1. Create instance (like new Pusher(...))
const realtime = new Realtime({
  host: 'https://messaging.yourdomain.com',
  auth: {
    token: userJwt          // JWT must contain { userId, appId }
  }
});

// 2. Subscribe
const channel = realtime.subscribe('orders.123');

// 3. Bind to events
channel.bind('status-updated', (data) => {
  console.log('Status:', data);
});

// 4. Trigger from client (optional)
channel.trigger('typing', { user: 'Alice' });
```

### Presence channels

```js
const presence = realtime.subscribe('presence-lobby');

presence.bind('subscription_succeeded', (data) => {
  console.log('Members:', data.members);
});

presence.bind('member_added', (member) => {
  console.log('Joined:', member);
});

presence.bind('member_removed', (member) => {
  console.log('Left:', member.userId);
});

console.log(presence.getMemberCount());
```

## Backend (Node.js)

```js
import { Realtime } from '@yoweli/realtime/server';

const realtime = new Realtime({
  host: 'https://messaging.yourdomain.com',
  token: process.env.MESSAGING_JWT
});

// Same signature as Pusher
await realtime.trigger('orders.123', 'status-updated', {
  status: 'ready',
  orderId: 123
});
```

## JWT format

Your auth service must issue tokens containing at least:

```json
{
  "userId": "user_123",
  "appId": "my-app",
  "userInfo": {
    "name": "Alice"
  }
}
```

`userInfo` is optional and is useful for presence channels.

## API

### `new Realtime(options)`

| Option            | Type    | Description                                      |
|-------------------|---------|--------------------------------------------------|
| `host`            | string  | **Required.** URL of your messaging service      |
| `auth.token`      | string  | JWT for authentication                           |
| `autoConnect`     | boolean | Default `true`                                   |

### Channel

| Method                  | Description                        |
|-------------------------|------------------------------------|
| `bind(event, callback)` | Listen for an event                |
| `unbind(event, cb?)`    | Remove listener(s)                 |
| `trigger(event, data)`  | Send event from client             |

### PresenceChannel (extra)

| Method            | Description                     |
|-------------------|---------------------------------|
| `getMembers()`    | Current members object          |
| `getMemberCount()`| Number of members               |

## License

MIT
