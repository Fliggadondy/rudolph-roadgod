import axios from "axios";
import { WebSocket } from "ws";
import { CONFIG } from "../config";
import type { RUDOLPH_VFS } from "./VFS";

// ──────────────────────────────────────────────────────────────
// Universal IoT Bridge
// Supports: MQTT, HTTP REST, WebSocket, Serial, and raw TCP
// Any IoT device can be connected through protocol adapters
// ──────────────────────────────────────────────────────────────

export type IoTProtocol = "mqtt" | "http" | "ws" | "serial" | "tcp" | "coap";

export interface IoTDeviceConfig {
  id: string;
  name: string;
  protocol: IoTProtocol;
  address: string; // URL, serial path, or host:port
  topic?: string; // MQTT topic or WS channel
  pollInterval?: number; // ms, for HTTP polling
  authToken?: string;
  metadata?: Record<string, unknown>;
}

export interface IoTMessage {
  deviceId: string;
  timestamp: number;
  payload: unknown;
  direction: "inbound" | "outbound";
}

type MessageHandler = (msg: IoTMessage) => void;

interface DeviceConnection {
  config: IoTDeviceConfig;
  client: any;
  active: boolean;
}

export class IoTBridge {
  private devices: Map<string, DeviceConnection> = new Map();
  private handlers: MessageHandler[] = [];
  private pollTimers: Map<string, ReturnType<typeof setInterval>> = new Map();

  constructor(private vfs: RUDOLPH_VFS) {}

  onMessage(fn: MessageHandler) {
    this.handlers.push(fn);
  }

  private emit(msg: IoTMessage) {
    this.vfs.seal("IOT_MSG", msg as unknown as object);
    this.handlers.forEach((fn) => fn(msg));
  }

  // ── Register & connect a device ──────────────────────────────
  async addDevice(config: IoTDeviceConfig): Promise<boolean> {
    if (this.devices.has(config.id)) {
      console.warn(`[IOT] Device ${config.id} already registered.`);
      return false;
    }

    try {
      switch (config.protocol) {
        case "mqtt":
          await this.connectMQTT(config);
          break;
        case "http":
          this.connectHTTP(config);
          break;
        case "ws":
          this.connectWebSocket(config);
          break;
        case "serial":
          await this.connectSerial(config);
          break;
        case "tcp":
          this.connectTCP(config);
          break;
        case "coap":
          this.connectCoAP(config);
          break;
        default:
          console.error(`[IOT] Unknown protocol: ${config.protocol}`);
          return false;
      }

      console.log(
        `[IOT] Device registered: ${config.name} (${config.protocol}://${config.address})`
      );
      return true;
    } catch (e) {
      console.error(`[IOT] Failed to connect ${config.name}:`, e);
      return false;
    }
  }

  // ── MQTT Adapter ─────────────────────────────────────────────
  private async connectMQTT(config: IoTDeviceConfig) {
    try {
      const mqtt = await import("mqtt");
      const client = mqtt.connect(config.address || CONFIG.MQTT_BROKER);

      client.on("connect", () => {
        const topic = config.topic || `rudolph/${config.id}/#`;
        client.subscribe(topic);
        console.log(`[IOT-MQTT] Subscribed to ${topic}`);
      });

      client.on("message", (_topic: string, message: Buffer) => {
        let payload: unknown;
        try {
          payload = JSON.parse(message.toString());
        } catch {
          payload = message.toString();
        }
        this.emit({
          deviceId: config.id,
          timestamp: Date.now(),
          payload,
          direction: "inbound",
        });
      });

      this.devices.set(config.id, { config, client, active: true });
    } catch {
      console.warn("[IOT-MQTT] mqtt module unavailable.");
    }
  }

  // ── HTTP REST Adapter (polling) ──────────────────────────────
  private connectHTTP(config: IoTDeviceConfig) {
    const interval = config.pollInterval || 5000;
    const headers: Record<string, string> = {};
    if (config.authToken) headers["Authorization"] = `Bearer ${config.authToken}`;

    const timer = setInterval(async () => {
      try {
        const res = await axios.get(config.address, {
          headers,
          timeout: CONFIG.IOT_HTTP_TIMEOUT,
        });
        this.emit({
          deviceId: config.id,
          timestamp: Date.now(),
          payload: res.data,
          direction: "inbound",
        });
      } catch {
        // Device temporarily unreachable
      }
    }, interval);

    this.pollTimers.set(config.id, timer);
    this.devices.set(config.id, { config, client: null, active: true });
  }

  // ── WebSocket Adapter ────────────────────────────────────────
  private connectWebSocket(config: IoTDeviceConfig) {
    const ws = new WebSocket(config.address);

    ws.on("open", () => {
      console.log(`[IOT-WS] Connected to ${config.address}`);
      if (config.topic) {
        ws.send(JSON.stringify({ subscribe: config.topic }));
      }
    });

    ws.on("message", (data) => {
      let payload: unknown;
      try {
        payload = JSON.parse(data.toString());
      } catch {
        payload = data.toString();
      }
      this.emit({
        deviceId: config.id,
        timestamp: Date.now(),
        payload,
        direction: "inbound",
      });
    });

    ws.on("close", () => {
      const dev = this.devices.get(config.id);
      if (dev) dev.active = false;
      // Auto-reconnect after 5s
      setTimeout(() => {
        if (this.devices.has(config.id)) this.connectWebSocket(config);
      }, 5000);
    });

    ws.on("error", () => {});

    this.devices.set(config.id, { config, client: ws, active: true });
  }

  // ── Serial Adapter ──────────────────────────────────────────
  private async connectSerial(config: IoTDeviceConfig) {
    try {
      const { SerialPort } = await import("serialport");
      const { ReadlineParser } = await import("@serialport/parser-readline");

      const port = new SerialPort({
        path: config.address,
        baudRate: 9600,
      });
      const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

      parser.on("data", (line: string) => {
        let payload: unknown;
        try {
          payload = JSON.parse(line);
        } catch {
          payload = line.trim();
        }
        this.emit({
          deviceId: config.id,
          timestamp: Date.now(),
          payload,
          direction: "inbound",
        });
      });

      this.devices.set(config.id, { config, client: port, active: true });
    } catch {
      console.warn(`[IOT-SERIAL] Cannot open ${config.address}`);
    }
  }

  // ── Raw TCP Adapter ──────────────────────────────────────────
  private connectTCP(config: IoTDeviceConfig) {
    try {
      const net = require("net");
      const [host, portStr] = config.address.split(":");
      const port = parseInt(portStr, 10);
      const socket = net.createConnection({ host, port });

      let buffer = "";
      socket.on("data", (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.trim()) {
            this.emit({
              deviceId: config.id,
              timestamp: Date.now(),
              payload: line.trim(),
              direction: "inbound",
            });
          }
        }
      });

      socket.on("error", () => {});
      this.devices.set(config.id, { config, client: socket, active: true });
    } catch {
      console.warn(`[IOT-TCP] Cannot connect to ${config.address}`);
    }
  }

  // ── CoAP Adapter (stub — needs coap library) ────────────────
  private connectCoAP(config: IoTDeviceConfig) {
    // CoAP observe pattern — poll via HTTP proxy if native CoAP unavailable
    console.log(
      `[IOT-COAP] CoAP device registered: ${config.id} (falling back to HTTP polling)`
    );
    const httpConfig = { ...config, protocol: "http" as IoTProtocol };
    this.connectHTTP(httpConfig);
  }

  // ── Send to device ──────────────────────────────────────────
  async send(deviceId: string, payload: unknown): Promise<boolean> {
    const dev = this.devices.get(deviceId);
    if (!dev || !dev.active) return false;

    const msg: IoTMessage = {
      deviceId,
      timestamp: Date.now(),
      payload,
      direction: "outbound",
    };

    try {
      switch (dev.config.protocol) {
        case "mqtt":
          dev.client?.publish(
            dev.config.topic || `rudolph/${deviceId}/cmd`,
            JSON.stringify(payload)
          );
          break;
        case "http":
          await axios.post(dev.config.address, payload, {
            timeout: CONFIG.IOT_HTTP_TIMEOUT,
          });
          break;
        case "ws":
          if (dev.client?.readyState === WebSocket.OPEN) {
            dev.client.send(JSON.stringify(payload));
          }
          break;
        case "serial":
          dev.client?.write(JSON.stringify(payload) + "\n");
          break;
        case "tcp":
          dev.client?.write(JSON.stringify(payload) + "\n");
          break;
        default:
          return false;
      }

      this.emit(msg);
      return true;
    } catch {
      return false;
    }
  }

  // ── Management ──────────────────────────────────────────────
  removeDevice(deviceId: string) {
    const timer = this.pollTimers.get(deviceId);
    if (timer) {
      clearInterval(timer);
      this.pollTimers.delete(deviceId);
    }

    const dev = this.devices.get(deviceId);
    if (dev?.client) {
      try {
        if (typeof dev.client.end === "function") dev.client.end();
        else if (typeof dev.client.close === "function") dev.client.close();
        else if (typeof dev.client.destroy === "function") dev.client.destroy();
      } catch {}
    }

    this.devices.delete(deviceId);
    console.log(`[IOT] Device removed: ${deviceId}`);
  }

  listDevices(): Array<{ id: string; name: string; protocol: IoTProtocol; active: boolean }> {
    return Array.from(this.devices.values()).map((d) => ({
      id: d.config.id,
      name: d.config.name,
      protocol: d.config.protocol,
      active: d.active,
    }));
  }

  shutdown() {
    for (const [id] of this.devices) {
      this.removeDevice(id);
    }
  }
}
