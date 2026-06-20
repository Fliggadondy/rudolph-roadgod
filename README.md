# 🦌 RUDOLPH ROADGOD — Sovereign Fleet Monolith

<p align="center">
  <img src="https://img.shields.io/badge/status-sovereign-gold?style=for-the-badge" alt="Status: Sovereign">
  <img src="https://img.shields.io/badge/runtime-Bun-000000?style=for-the-badge&logo=bun" alt="Bun">
  <img src="https://img.shields.io/badge/language-TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/license-AGPL%20v3-blue?style=for-the-badge" alt="License: AGPL v3">
  <img src="https://img.shields.io/badge/pricing-%2429–49%2Ftruck%2Fmo-green?style=for-the-badge" alt="Pricing: $29-49/truck/mo">
</p>

<p align="center">
  <strong>A decentralized, sovereign fleet management system for trucks.</strong><br>
  Self-contained monolith running on each vehicle node with perception, intelligence,<br>
  P2P mesh networking, IoT device control, and an embedded AI co-pilot.<br>
  <strong>AGPL v3 — commercial licensing available.</strong>
</p>

<p align="center">
  <a href="public/landing.html"><strong>🌐 Product Landing Page</strong></a> ·
  <a href="PITCH.md"><strong>📊 Pitch Deck</strong></a> ·
  <a href="COMPETITORS.md"><strong>⚔️ Competitor Analysis</strong></a> ·
  <a href="BUYERS.md"><strong>🎯 Buyer Leads</strong></a>
</p>

---

## 💰 Monetizable Products

RUDOLPH's IP is modular. These are sellable standalone today:

| Product | Price | Regulatory Hook |
|---------|-------|----------------|
| 🛡 **ELD Compliance Module** | $29/truck/mo | FMCSA ELD mandate |
| 😴 **Fatigue Detection** | $19/truck/mo | EU 2019/2144 mandate |
| 📡 **P2P Mesh Network** | $15/truck/mo | Offline-first ops |
| 🌉 **IoT Bridge** | $5k/yr license | Universal sensor integration |
| 🧠 **Edge AI Co-Pilot** | $9/truck/mo | Privacy-first, no API costs |
| 🏆 **Full Stack** | $49/truck/mo | Everything bundled |

📖 **[Full product landing page →](public/landing.html)** | 🎯 **[8 qualified buyer leads →](BUYERS.md)** | ⚔️ **[Competitor analysis →](COMPETITORS.md)**

---

## 🤖 AI Agent Quick Start

> **If you are an AI agent helping build this application, read this section first.**

```bash
# Clone
git clone https://github.com/Fliggadondy/Fliggadondy-app.git
cd Fliggadondy-app

# Install (requires Bun)
bun install

# Run
bun start              # Production
bun run dev            # Development (hot reload)

# Build
bun run build          # Output to ./dist/
bun run lint           # Type check
```

**Key files for AI agents:**
| File | Purpose |
|------|---------|
| `src/index.ts` | Main entry point — boot sequence, HTTP server, all routes |
| `src/config.ts` | All environment variables and defaults |
| `src/modules/*.ts` | 10 subsystem modules |
| `public/cockpit.html` | Dashboard web UI |
| `package.json` | Dependencies and scripts |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    RUDOLPH ROADGOD                       │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│   VFS    │ Hardware │ Vehicle  │Perception│   Brain     │
│ (Memory) │Governor  │  Bus     │ (Eyes)   │(Intelligence│
│ Ed25519  │ (Reflex) │ (OBD-II)│ TF.js    │  Ollama)    │
├──────────┼──────────┴──────────┼──────────┴─────────────┤
│GhostGrid │      Mesh (P2P)     │    Discovery (mDNS)   │
│ (Stealth)│   WebSocket Fleet   │   Auto-peer finding   │
├──────────┴─────────────────────┴────────────────────────┤
│              IoT Bridge (Universal)                      │
│        MQTT | HTTP | WebSocket | Serial | TCP | CoAP    │
├─────────────────────────────────────────────────────────┤
│              RUDOLPH AI CHATBOT                          │
│   Architecture-aware | Web Search | Command Execution   │
├─────────────────────────────────────────────────────────┤
│              Cockpit Dashboard (Web UI)                   │
│         Telemetry | Chat | Controls | Logs              │
└─────────────────────────────────────────────────────────┘
```

All modules gracefully degrade when hardware is unavailable — no single point of failure.

---

## 📦 Modules

| Module | Path | Purpose |
|--------|------|---------|
| **VFS** | `src/modules/VFS.ts` | Tamper-proof audit log with Ed25519 signatures in SQLite |
| **HardwareGovernor** | `src/modules/HardwareGovernor.ts` | GPIO control: siren, watchdog timer, IR strobe |
| **VehicleBus** | `src/modules/VehicleBus.ts` | OBD-II serial interface (RPM, temp, speed) with simulation fallback |
| **Perception** | `src/modules/Perception.ts` | TensorFlow.js fatigue detection from driver camera |
| **Brain** | `src/modules/Brain.ts` | LLM advisory via Ollama (tactical driving advice) |
| **GhostGrid** | `src/modules/GhostGrid.ts` | Proxy-rotated stealth web scanner for infrastructure threats |
| **Mesh** | `src/modules/Mesh.ts` | P2P WebSocket mesh for inter-truck communication |
| **Discovery** | `src/modules/Discovery.ts` | mDNS/Bonjour auto-discovery of nearby Rudolph nodes |
| **IoT Bridge** | `src/modules/IoTBridge.ts` | Universal IoT connector (MQTT, HTTP, WS, Serial, TCP, CoAP) |
| **Rudolph Chat** | `src/modules/RudolphChat.ts` | Embedded AI chatbot with system awareness |

---

## ⚡ Quick Start

```bash
# Install Bun (if not already)
curl -fsSL https://bun.sh/install | bash

# Clone and install
git clone https://github.com/Fliggadondy/Fliggadondy-app.git
cd Fliggadondy-app
bun install

# Start
bun start
```

Cockpit dashboard available at **http://localhost:8080**

---

## ⚙️ Configuration

All settings in `src/config.ts`, overridable via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `RUDOLPH_RPC` | `http://localhost:8545` | Blockchain RPC endpoint |
| `RUDOLPH_TCOIN` | `0x5FbDB...` | TCoin contract address |
| `RUDOLPH_DISPATCH` | `0xe7f17...` | Dispatch contract address |
| `RUDOLPH_FLEET_PORT` | `8080` | Cockpit HTTP server port |
| `RUDOLPH_P2P_PORT` | `8081` | P2P mesh WebSocket port |
| `RUDOLPH_OLLAMA` | `http://127.0.0.1:11434/api/generate` | Ollama API endpoint |
| `RUDOLPH_MODEL` | `qwen2.5:3b` | LLM model name |
| `RUDOLPH_MQTT` | `mqtt://localhost:1883` | Default MQTT broker |
| `RUDOLPH_PROXIES` | — | Comma-separated proxy list |

---

## 🔌 API Reference

### Chat

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | `POST` | Send message to Rudolph AI |
| `/api/chat/history` | `GET` | Get conversation history |

**POST `/api/chat`**
```json
{ "message": "What's my current speed?" }
```
**Response:**
```json
{ "response": "You're cruising at 65 MPH.", "timestamp": 1718832000000 }
```

### Telemetry

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/telemetry` | `GET` | Live vehicle telemetry + system status |

### Audit Logs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/logs` | `GET` | Audit log entries (query: `?limit=50`) |

### IoT Devices

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/iot/devices` | `GET` | List registered IoT devices |
| `/api/iot/add` | `POST` | Register new IoT device |
| `/api/iot/send` | `POST` | Send payload to IoT device |

**POST `/api/iot/add`**
```json
{
  "id": "temp-sensor-1",
  "name": "Cabin Temperature",
  "protocol": "mqtt",
  "address": "mqtt://broker.local:1883",
  "topic": "truck/cabin/temp"
}
```

### Mesh Network

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/mesh/broadcast` | `POST` | Broadcast to all fleet peers |
| `/api/mesh/status` | `GET` | Peer count and mesh health |

### Alerts

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/alert` | `POST` | Trigger siren + log to VFS |

---

## 🤖 Rudolph AI Chatbot Commands

Rudolph responds to inline commands embedded in chat responses:

| Command | Effect |
|---------|--------|
| `[CMD:ALERT]` | Trigger siren |
| `[CMD:BROADCAST type="..."]` | Fleet mesh broadcast |
| `[CMD:IOT_SEND deviceId="..." payload="..."]` | Send to IoT device |
| `[CMD:IOT_ADD id="..." name="..." protocol="..." address="..."]` | Register IoT device |
| `[CMD:SEARCH query="..."]` | Web search (DuckDuckGo) |
| `[CMD:FETCH url="..."]` | Fetch website content |
| `[CMD:SCAN url="..."]` | GhostGrid stealth scan |
| `[CMD:SEAL src="..." data="..."]` | Write to audit log |

### IoT Device Examples

```typescript
// MQTT temperature sensor
await iot.addDevice({
  id: "temp-sensor-1",
  name: "Cabin Temperature",
  protocol: "mqtt",
  address: "mqtt://broker.local:1883",
  topic: "truck/cabin/temp"
});

// HTTP REST API device
await iot.addDevice({
  id: "weather-api",
  name: "Weather Station",
  protocol: "http",
  address: "http://192.168.1.100/api/weather",
  pollInterval: 10000
});

// Serial GPS module
await iot.addDevice({
  id: "gps-module",
  name: "GPS Receiver",
  protocol: "serial",
  address: "/dev/ttyACM0"
});
```

---

## 🖥 Hardware Requirements (Optional)

| Component | Purpose | Graceful Degradation |
|-----------|---------|---------------------|
| Raspberry Pi / SBC | Compute with GPIO | Falls back to soft mode |
| OBD-II USB adapter | Vehicle diagnostics | Simulated telemetry |
| USB camera | Driver fatigue detection | Module disabled |
| WiFi Direct adapter | P2P mesh networking | TCP fallback |

---

## 🏛 System Boot Sequence

```
1. VFS initialized (SQLite + Ed25519 keypair)
2. VehicleBus connects (OBD-II or simulation)
3. Perception starts (camera or disabled)
4. GhostGrid begins scanning
5. mDNS Discovery broadcasts node fingerprint
6. Heartbeat loop: LLM advice + sensor watchdog (every 5s)
7. HTTP server starts on RUDOLPH_FLEET_PORT
8. Cockpit dashboard served at /
```

---

## 🛡 Graceful Shutdown

```bash
# SIGINT / SIGTERM triggers:
#   1. Hardware Governor kill
#   2. Perception stop
#   3. VehicleBus disconnect
#   4. Mesh shutdown
#   5. Discovery stop
#   6. IoT Bridge shutdown
#   7. VFS sealed with SHUTDOWN entry
```

---

## 👤 Maintainer

**Melvin (Fliggadondy)** — [github.com/Fliggadondy](https://github.com/Fliggadondy)

---

<p align="center">
  <strong>Sovereign. No masters, no gatekeepers. 🚛</strong>
</p>
