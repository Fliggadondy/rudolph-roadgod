import { RUDOLPH_VFS } from "./modules/VFS";
import { HardwareGovernor } from "./modules/HardwareGovernor";
import { VehicleBus } from "./modules/VehicleBus";
import { Perception } from "./modules/Perception";
import { Brain } from "./modules/Brain";
import { GhostGrid } from "./modules/GhostGrid";
import { RudolphMesh } from "./modules/Mesh";
import { Discovery } from "./modules/Discovery";
import { IoTBridge } from "./modules/IoTBridge";
import { RudolphChat } from "./modules/RudolphChat";
import { CONFIG } from "./config";
import { serve } from "bun";
import { readFileSync, existsSync } from "fs";

// ──────────────────────────────────────────────────────────────
// RUDOLPH ROADGOD — Sovereign Fleet Monolith
// ──────────────────────────────────────────────────────────────

const vfs = new RUDOLPH_VFS();
const hw = new HardwareGovernor();
const bus = new VehicleBus();
const per = new Perception(hw);
const br = new Brain();
const grid = new GhostGrid();
const mesh = new RudolphMesh(vfs);
const discovery = new Discovery(mesh);
const iot = new IoTBridge(vfs);

const rudolph = new RudolphChat({
  vfs,
  bus,
  grid,
  mesh,
  iot,
  hw,
  perception: per,
});

async function boot() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║     RUDOLPH ROADGOD — BOOTING...     ║");
  console.log("╚══════════════════════════════════════╝");

  // Initialize subsystems
  await bus.connect();
  await per.init();

  // Fatigue detection → siren + VFS log + fleet broadcast
  per.start((score) => {
    hw.alert();
    vfs.seal("ALARM", { score });
    mesh.broadcast("DRIVER_FATIGUE", { score, speed: bus.state.speed });
  });

  // GhostGrid threat → mesh broadcast
  grid.onThreatDetected((threat) => {
    mesh.broadcast("INFRA_HAZARD", threat);
  });

  // mDNS discovery for nearby Rudolph nodes
  const nodeFingerprint = vfs.publicKey.slice(27, 47).trim();
  await discovery.start(nodeFingerprint);

  // Heartbeat: LLM advice + sensor watchdog
  setInterval(async () => {
    if (per.available && Date.now() - per.lastPulse > 10000) {
      hw.kill();
      console.error("CRITICAL: SENSOR TIMEOUT");
      vfs.seal("CRITICAL", { reason: "SENSOR_TIMEOUT" });
    }
    const adv = await br.ask(bus.state, grid.threats);
    console.log(`[RUDOLPH] ${adv}`);
  }, 5000);

  // ── HTTP Server — Cockpit Dashboard + API ──────────────────
  serve({
    port: CONFIG.FLEET_PORT,
    async fetch(req) {
      const url = new URL(req.url);

      // Cockpit HTML
      if (url.pathname === "/" || url.pathname === "/cockpit") {
        const htmlPath = "./public/cockpit.html";
        if (existsSync(htmlPath)) {
          return new Response(Bun.file(htmlPath), {
            headers: { "Content-Type": "text/html" },
          });
        }
        return new Response("Cockpit not found", { status: 404 });
      }

      // ── API: Rudolph Chat ────────────────────────────────
      if (url.pathname === "/api/chat" && req.method === "POST") {
        try {
          const body = (await req.json()) as { message: string };
          const response = await rudolph.chat(body.message);
          return Response.json({ response, timestamp: Date.now() });
        } catch (e: any) {
          return Response.json({ error: e.message }, { status: 400 });
        }
      }

      // ── API: Telemetry ───────────────────────────────────
      if (url.pathname === "/api/telemetry") {
        return Response.json({
          vehicle: bus.state,
          threats: grid.getRecent(10),
          meshPeers: mesh.getPeerCount(),
          iotDevices: iot.listDevices(),
          hwAvailable: hw.available,
          perceptionAvailable: per.available,
          nodeKey: vfs.publicKey.slice(0, 60) + "...",
        });
      }

      // ── API: Audit Logs ──────────────────────────────────
      if (url.pathname === "/api/logs") {
        const limit = parseInt(url.searchParams.get("limit") || "50", 10);
        return Response.json(vfs.queryLogs(limit));
      }

      // ── API: IoT Devices ─────────────────────────────────
      if (url.pathname === "/api/iot/devices") {
        return Response.json(iot.listDevices());
      }

      if (url.pathname === "/api/iot/add" && req.method === "POST") {
        const config = (await req.json()) as any;
        const ok = await iot.addDevice(config);
        return Response.json({ success: ok });
      }

      if (url.pathname === "/api/iot/send" && req.method === "POST") {
        const { deviceId, payload } = (await req.json()) as any;
        const ok = await iot.send(deviceId, payload);
        return Response.json({ success: ok });
      }

      // ── API: Mesh ────────────────────────────────────────
      if (url.pathname === "/api/mesh/broadcast" && req.method === "POST") {
        const { type, metadata } = (await req.json()) as any;
        mesh.broadcast(type, metadata);
        return Response.json({ success: true });
      }

      if (url.pathname === "/api/mesh/status") {
        return Response.json({ peers: mesh.getPeerCount() });
      }

      // ── API: Alert ───────────────────────────────────────
      if (url.pathname === "/api/alert" && req.method === "POST") {
        hw.alert();
        vfs.seal("MANUAL_ALERT", { source: "cockpit" });
        return Response.json({ triggered: true });
      }

      // ── API: Chat History ────────────────────────────────
      if (url.pathname === "/api/chat/history") {
        return Response.json(rudolph.getHistory());
      }

      return new Response("Not Found", { status: 404 });
    },
  });

  vfs.seal("BOOT", { modules: ["VFS", "HW", "BUS", "PERCEPTION", "BRAIN", "GHOSTGRID", "MESH", "DISCOVERY", "IOT", "RUDOLPH_CHAT"] });

  console.log("╔══════════════════════════════════════╗");
  console.log(`║   RUDOLPH ONLINE — Port ${CONFIG.FLEET_PORT}          ║`);
  console.log(`║   P2P Mesh     — Port ${CONFIG.P2P_PORT}          ║`);
  console.log("║   Cockpit: http://localhost:" + CONFIG.FLEET_PORT + "     ║");
  console.log("╚══════════════════════════════════════╝");
}

boot().catch((e) => {
  console.error("FATAL BOOT FAILURE:", e);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n[RUDOLPH] Shutting down...");
  hw.kill();
  per.stop();
  bus.disconnect();
  mesh.shutdown();
  discovery.stop();
  iot.shutdown();
  vfs.seal("SHUTDOWN", { reason: "SIGINT" });
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n[RUDOLPH] Terminated.");
  hw.kill();
  process.exit(0);
});
