# RUDOLPH ROADGOD — Sovereign Fleet Monolith

A decentralized, sovereign fleet management system for trucks. Rudolph is a self-contained monolith that runs on each vehicle node, providing perception, intelligence, P2P mesh networking, IoT device control, and an embedded AI co-pilot chatbot.

## Architecture

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

## Modules

| Module | Description |
|--------|-------------|
| **VFS** | Tamper-proof audit log with Ed25519 signatures in SQLite |
| **HardwareGovernor** | GPIO control for siren, watchdog timer, IR strobe (graceful degradation on non-GPIO platforms) |
| **VehicleBus** | OBD-II serial interface for real-time RPM, temperature, speed (simulation fallback) |
| **Perception** | TensorFlow.js fatigue detection from driver camera via ffmpeg |
| **Brain** | LLM advisory via Ollama for tactical driving advice |
| **GhostGrid** | Proxy-rotated stealth web scanner for infrastructure threat detection |
| **Mesh** | P2P WebSocket mesh for inter-truck communication with signed packets |
| **Discovery** | mDNS/Bonjour auto-discovery of nearby Rudolph nodes |
| **IoT Bridge** | Universal connector for any IoT device (MQTT, HTTP, WebSocket, Serial, TCP, CoAP) |
| **Rudolph Chat** | Embedded AI chatbot — architecture-aware, web search, command execution |

## Quick Start

```bash
# Install dependencies
bun install

# Start the system
bun start

# Development mode (hot reload)
bun run dev
```

The cockpit dashboard will be available at `http://localhost:8080`.

## Configuration

All configuration is in `src/config.ts` and can be overridden with environment variables:

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
| `RUDOLPH_PROXIES` | `http://localhost:8888,...` | Comma-separated proxy list |

## Rudolph AI Chatbot

Rudolph is the embedded AI co-pilot that knows the full system architecture. He can:

- **Monitor telemetry** — vehicle speed, RPM, engine temperature
- **Search the web** — DuckDuckGo integration for real-time information
- **Execute commands** — trigger alerts, broadcast to fleet, manage IoT devices
- **Control IoT devices** — send/receive data through any protocol
- **Access audit logs** — query the tamper-proof VFS

### Chat Commands (embedded in responses)

Rudolph can execute these commands inline:
- `[CMD:ALERT]` — Trigger siren
- `[CMD:BROADCAST type="..."]` — Fleet mesh broadcast
- `[CMD:IOT_SEND deviceId="..." payload="..."]` — Send to IoT device
- `[CMD:IOT_ADD id="..." name="..." protocol="..." address="..."]` — Register IoT device
- `[CMD:SEARCH query="..."]` — Web search
- `[CMD:FETCH url="..."]` — Fetch website content
- `[CMD:SCAN url="..."]` — GhostGrid stealth scan
- `[CMD:SEAL src="..." data="..."]` — Write to audit log

## IoT Bridge

The universal IoT Bridge supports connecting any device:

```typescript
// Example: Add an MQTT temperature sensor
await iot.addDevice({
  id: "temp-sensor-1",
  name: "Cabin Temperature",
  protocol: "mqtt",
  address: "mqtt://broker.local:1883",
  topic: "truck/cabin/temp"
});

// Example: Add an HTTP REST API device
await iot.addDevice({
  id: "weather-api",
  name: "Weather Station",
  protocol: "http",
  address: "http://192.168.1.100/api/weather",
  pollInterval: 10000
});

// Example: Add a serial GPS module
await iot.addDevice({
  id: "gps-module",
  name: "GPS Receiver",
  protocol: "serial",
  address: "/dev/ttyACM0"
});
```

## P2P Mesh Network

Trucks automatically discover each other via mDNS on the same network and establish WebSocket connections. All packets are Ed25519-signed for authenticity.

When one truck detects a hazard (fatigue, infrastructure threat, weather), it broadcasts to all connected peers. No central server required.

## Hardware Requirements (Optional)

- Raspberry Pi or similar SBC with GPIO
- OBD-II USB adapter
- USB camera (for fatigue detection)
- WiFi adapter supporting ad-hoc/WiFi Direct (for mesh)

The system gracefully degrades when hardware is unavailable — all modules fall back to simulation/soft mode.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Cockpit dashboard |
| `/api/chat` | POST | Send message to Rudolph |
| `/api/chat/history` | GET | Get chat history |
| `/api/telemetry` | GET | Live vehicle telemetry |
| `/api/logs` | GET | Audit log entries |
| `/api/alert` | POST | Trigger siren alert |
| `/api/iot/devices` | GET | List IoT devices |
| `/api/iot/add` | POST | Register IoT device |
| `/api/iot/send` | POST | Send to IoT device |
| `/api/mesh/broadcast` | POST | Fleet broadcast |
| `/api/mesh/status` | GET | Mesh peer count |

## License

Sovereign. No masters, no gatekeepers.
