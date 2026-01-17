# node-red-contrib-tapo-p125m

Node-RED nodes for controlling the **TP-Link Tapo P125M** smart plug using the local Tapo protocol via `tp-link-tapo-connect`.

This module provides reliable ON / OFF / STATUS control for the P125M, which is not fully supported by some existing Tapo Node-RED nodes.

## Features

- Explicit support for **Tapo P125M**
- Separate nodes for **ON**, **OFF**, and **STATUS**
- Shared **configuration node** for IP + credentials
- Credentials stored securely in **Node-RED credential storage**
- Optional environment-variable based credentials
- No cloud dependency (local LAN control)

## Nodes

### Config Node
**tapo-device**
Stores the IP address and credentials for a Tapo device. Can be reused across multiple action nodes.

### Action Nodes
- **P125M on**
- **P125M off**
- **P125M status**

Each action node references a `tapo-device` config node.

## Installation

### Via Palette Manager
Search for:

```
node-red-contrib-tapo-p125m
```

### Manual Install
```bash
cd ~/.node-red
npm install node-red-contrib-tapo-p125m
```

Restart Node-RED after installation.

## Credentials

Credentials are stored securely in `flows_cred.json` and are not included in exported flows.

Recommended setting in `settings.js`:

```js
credentialSecret: "your-long-random-string"
```

## Environment Variable Option

```bash
export TAPO_EMAIL="you@example.com"
export TAPO_PASSWORD="yourpassword"
```

Enable **Use env vars** in the `tapo-device` config node.

## Example Output

```json
{
  "ok": true,
  "cmd": "on",
  "ip": "192.168.1.11",
  "device_on": true,
  "model": "P125M"
}
```

## Compatibility

- Node-RED >= 3.x
- Node.js >= 18
- TP-Link Tapo P125M

## License

MIT

## Author

Dave Ginsberg (N3BKV)
