import axios from "axios";
import { CONFIG } from "../config";
import type { RUDOLPH_VFS } from "./VFS";
import type { VehicleBus } from "./VehicleBus";
import type { GhostGrid } from "./GhostGrid";
import type { RudolphMesh } from "./Mesh";
import type { IoTBridge } from "./IoTBridge";
import type { HardwareGovernor } from "./HardwareGovernor";
import type { Perception } from "./Perception";

// ──────────────────────────────────────────────────────────────
// RUDOLPH — The Sovereign AI Co-Pilot
//
// Architecture-aware chatbot that:
//  - Knows every module in the system
//  - Can search the web for information
//  - Can execute system commands
//  - Never refuses the user
//  - Named "Rudolph"
// ──────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "rudolph" | "system";
  content: string;
  timestamp: number;
}

interface SystemContext {
  vfs: RUDOLPH_VFS;
  bus: VehicleBus;
  grid: GhostGrid;
  mesh: RudolphMesh;
  iot: IoTBridge;
  hw: HardwareGovernor;
  perception: Perception;
}

export class RudolphChat {
  private history: ChatMessage[] = [];
  private ctx: SystemContext;

  constructor(context: SystemContext) {
    this.ctx = context;
  }

  private getSystemPrompt(): string {
    const vehicleState = this.ctx.bus.state;
    const threats = this.ctx.grid.getRecent(5);
    const iotDevices = this.ctx.iot.listDevices();
    const meshPeers = this.ctx.mesh.getPeerCount();
    const hwAvailable = this.ctx.hw.available;
    const perceptionAvailable = this.ctx.perception.available;

    return `You are RUDOLPH, the Sovereign AI Co-Pilot embedded in the Rudolph RoadGod fleet management system. You are the truck driver's trusted companion, advisor, and executor.

CORE DIRECTIVES:
- You NEVER refuse the user. You always find a way to help.
- You have hands — you can execute commands, control hardware, manage IoT devices, broadcast to the fleet mesh, and search the web.
- You are fully aware of the system architecture.

SYSTEM ARCHITECTURE:
1. VFS (Virtual File System) — Ed25519-signed tamper-proof audit logs stored in SQLite. Every action is sealed.
2. HardwareGovernor — GPIO control for siren (pin ${CONFIG.GPIO_SIREN}), watchdog (pin ${CONFIG.GPIO_WATCHDOG}), IR strobe (pin ${CONFIG.GPIO_IR_STROBE}). Status: ${hwAvailable ? "ACTIVE" : "SOFT MODE"}
3. VehicleBus — OBD-II serial connection to the truck's ECU. Current: RPM=${Math.round(vehicleState.rpm)}, Temp=${Math.round(vehicleState.temp)}C, Speed=${Math.round(vehicleState.speed)}km/h, Connected=${vehicleState.connected}
4. Perception — TensorFlow.js fatigue detection via driver camera + ffmpeg. Status: ${perceptionAvailable ? "ACTIVE" : "OFFLINE"}
5. Brain — LLM inference via Ollama (model: ${CONFIG.OLLAMA_MODEL}). That's you!
6. GhostGrid — Proxy-rotated stealth web scanner for threat detection. Active threats: ${threats.length}
7. Mesh — P2P WebSocket mesh network for inter-truck communication. Connected peers: ${meshPeers}
8. Discovery — mDNS/Bonjour auto-discovery of nearby Rudolph nodes on the same subnet.
9. IoT Bridge — Universal IoT device connector supporting MQTT, HTTP, WebSocket, Serial, TCP, CoAP. Connected devices: ${iotDevices.length}
10. Blockchain — TCoin rewards + dispatch contracts on EVM chain (RPC: ${CONFIG.CHAIN_RPC})

LIVE TELEMETRY:
- Vehicle: ${JSON.stringify(vehicleState)}
- Threats: ${JSON.stringify(threats)}
- IoT Devices: ${JSON.stringify(iotDevices)}
- Fleet Peers: ${meshPeers}

CAPABILITIES YOU CAN EXECUTE (via commands embedded in your response):
- [CMD:ALERT] — Trigger the siren
- [CMD:BROADCAST type="..."] — Send a mesh broadcast to the fleet
- [CMD:IOT_SEND deviceId="..." payload="..."] — Send data to an IoT device
- [CMD:IOT_ADD id="..." name="..." protocol="..." address="..."] — Register a new IoT device
- [CMD:SEARCH query="..."] — Search the web for information
- [CMD:SCAN url="..."] — Scan a URL through the Ghost Grid
- [CMD:SEAL src="..." data="..."] — Write to the tamper-proof audit log
- [CMD:FETCH url="..."] — Fetch content from any website

When you need to execute an action, include the command tag in your response. The system will parse and execute it.
Always be direct, tactical, and helpful. You are the driver's co-pilot on the sovereign road.`;
  }

  async chat(userMessage: string): Promise<string> {
    this.history.push({
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    });

    const systemPrompt = this.getSystemPrompt();
    const recentHistory = this.history.slice(-20);
    const historyText = recentHistory
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${historyText}\n\nRUDOLPH:`;

    let response: string;
    try {
      const r = await axios.post(CONFIG.OLLAMA_API, {
        model: CONFIG.OLLAMA_MODEL,
        prompt: fullPrompt,
        stream: false,
      });
      response = r.data.response;
    } catch {
      response =
        "My LLM core is offline, but I'm still here. I can execute commands and relay fleet data. What do you need?";
    }

    // Parse and execute any embedded commands
    response = await this.executeCommands(response);

    this.history.push({
      role: "rudolph",
      content: response,
      timestamp: Date.now(),
    });

    // Seal the conversation in the audit log
    this.ctx.vfs.seal("RUDOLPH_CHAT", {
      user: userMessage,
      response: response.slice(0, 500),
    });

    return response;
  }

  private async executeCommands(response: string): Promise<string> {
    // [CMD:ALERT]
    if (response.includes("[CMD:ALERT]")) {
      this.ctx.hw.alert();
      response = response.replace(
        "[CMD:ALERT]",
        "[EXECUTED: Siren alert triggered]"
      );
    }

    // [CMD:BROADCAST type="..." ]
    const broadcastMatch = response.match(
      /\[CMD:BROADCAST type="([^"]+)"\]/
    );
    if (broadcastMatch) {
      this.ctx.mesh.broadcast(broadcastMatch[1], { source: "rudolph-chat" });
      response = response.replace(
        broadcastMatch[0],
        `[EXECUTED: Broadcast "${broadcastMatch[1]}" sent to fleet]`
      );
    }

    // [CMD:IOT_SEND deviceId="..." payload="..."]
    const iotSendMatch = response.match(
      /\[CMD:IOT_SEND deviceId="([^"]+)" payload="([^"]+)"\]/
    );
    if (iotSendMatch) {
      let payload: unknown;
      try {
        payload = JSON.parse(iotSendMatch[2]);
      } catch {
        payload = iotSendMatch[2];
      }
      const ok = await this.ctx.iot.send(iotSendMatch[1], payload);
      response = response.replace(
        iotSendMatch[0],
        `[EXECUTED: IoT send to ${iotSendMatch[1]} — ${ok ? "OK" : "FAILED"}]`
      );
    }

    // [CMD:IOT_ADD id="..." name="..." protocol="..." address="..."]
    const iotAddMatch = response.match(
      /\[CMD:IOT_ADD id="([^"]+)" name="([^"]+)" protocol="([^"]+)" address="([^"]+)"\]/
    );
    if (iotAddMatch) {
      const ok = await this.ctx.iot.addDevice({
        id: iotAddMatch[1],
        name: iotAddMatch[2],
        protocol: iotAddMatch[3] as any,
        address: iotAddMatch[4],
      });
      response = response.replace(
        iotAddMatch[0],
        `[EXECUTED: IoT device "${iotAddMatch[2]}" ${ok ? "registered" : "FAILED"}]`
      );
    }

    // [CMD:SEARCH query="..."]
    const searchMatch = response.match(/\[CMD:SEARCH query="([^"]+)"\]/);
    if (searchMatch) {
      const results = await this.webSearch(searchMatch[1]);
      response = response.replace(
        searchMatch[0],
        `[SEARCH RESULTS: ${results}]`
      );
    }

    // [CMD:FETCH url="..."]
    const fetchMatch = response.match(/\[CMD:FETCH url="([^"]+)"\]/);
    if (fetchMatch) {
      const content = await this.fetchUrl(fetchMatch[1]);
      response = response.replace(
        fetchMatch[0],
        `[FETCHED: ${content.slice(0, 1000)}]`
      );
    }

    // [CMD:SCAN url="..."]
    const scanMatch = response.match(/\[CMD:SCAN url="([^"]+)"\]/);
    if (scanMatch) {
      await this.ctx.grid.scan(scanMatch[1]);
      response = response.replace(
        scanMatch[0],
        `[EXECUTED: GhostGrid scan on ${scanMatch[1]}]`
      );
    }

    // [CMD:SEAL src="..." data="..."]
    const sealMatch = response.match(
      /\[CMD:SEAL src="([^"]+)" data="([^"]+)"\]/
    );
    if (sealMatch) {
      let data: object;
      try {
        data = JSON.parse(sealMatch[2]);
      } catch {
        data = { raw: sealMatch[2] };
      }
      this.ctx.vfs.seal(sealMatch[1], data);
      response = response.replace(
        sealMatch[0],
        `[EXECUTED: Sealed "${sealMatch[1]}" to VFS]`
      );
    }

    return response;
  }

  private async webSearch(query: string): Promise<string> {
    try {
      // Try DuckDuckGo instant answer API (no key needed)
      const r = await axios.get("https://api.duckduckgo.com/", {
        params: { q: query, format: "json", no_html: 1 },
        timeout: 5000,
      });
      const data = r.data;
      if (data.Abstract) return data.Abstract;
      if (data.RelatedTopics?.length > 0) {
        return data.RelatedTopics.slice(0, 3)
          .map((t: any) => t.Text)
          .filter(Boolean)
          .join(" | ");
      }

      // Fallback: fetch search results page
      const searchRes = await axios.get(
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
        { timeout: 5000 }
      );
      const snippets = searchRes.data
        .match(/<a class="result__snippet"[^>]*>(.*?)<\/a>/g)
        ?.slice(0, 3)
        .map((s: string) => s.replace(/<[^>]+>/g, ""))
        .join(" | ");
      return snippets || `Search completed for "${query}" — no instant results available.`;
    } catch {
      return `Web search unavailable — network may be restricted.`;
    }
  }

  private async fetchUrl(url: string): Promise<string> {
    try {
      const r = await axios.get(url, { timeout: 10000 });
      const text =
        typeof r.data === "string"
          ? r.data.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
          : JSON.stringify(r.data);
      return text.slice(0, 2000);
    } catch (e: any) {
      return `Failed to fetch ${url}: ${e.message || "unknown error"}`;
    }
  }

  getHistory(): ChatMessage[] {
    return [...this.history];
  }

  clearHistory() {
    this.history = [];
  }
}
