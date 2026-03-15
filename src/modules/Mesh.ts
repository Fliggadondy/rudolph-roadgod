import { WebSocketServer, WebSocket } from "ws";
import { CONFIG } from "../config";
import type { RUDOLPH_VFS } from "./VFS";

interface MeshPacket {
  payload: string; // JSON string: { type, metadata, node }
  sig: string;
}

export class RudolphMesh {
  private server: WebSocketServer;
  private peers: Map<string, WebSocket> = new Map();

  constructor(private vfs: RUDOLPH_VFS) {
    this.server = new WebSocketServer({ port: CONFIG.P2P_PORT });
    this.server.on("connection", (ws, req) => {
      const addr = req.socket.remoteAddress ?? "unknown";
      this._registerPeer(addr, ws);
    });
    console.log(`[MESH] Listening on :${CONFIG.P2P_PORT}`);
  }

  connect(address: string) {
    if (this.peers.has(address)) return;
    const ws = new WebSocket(`ws://${address}:${CONFIG.P2P_PORT}`);
    ws.on("open", () => {
      this._registerPeer(address, ws);
      console.log(`[MESH] Connected -> ${address}`);
    });
    ws.on("error", () => {
      // Peer offline — silent
    });
  }

  private _registerPeer(addr: string, ws: WebSocket) {
    this.peers.set(addr, ws);
    console.log(
      `[MESH] Peer linked: ${addr} (fleet size: ${this.peers.size})`
    );

    ws.on("message", (raw) => this._handlePacket(raw.toString()));
    ws.on("close", () => {
      this.peers.delete(addr);
      console.log(`[MESH] Peer dropped: ${addr}`);
    });
  }

  private _handlePacket(raw: string) {
    try {
      const packet: MeshPacket = JSON.parse(raw);
      const parsed = JSON.parse(packet.payload);

      if (!this.vfs.verify(packet.sig, packet.payload, parsed.node)) {
        console.warn("[MESH] Signature verification FAILED — packet dropped.");
        return;
      }

      this.vfs.seal("PEER_THREAT", parsed);
      console.log(
        `[MESH] Verified threat from ${parsed.node?.slice(0, 40)}... type=${parsed.type}`
      );
    } catch (e) {
      console.error("[MESH] Malformed packet:", e);
    }
  }

  broadcast(type: string, metadata: object) {
    const payload = JSON.stringify({
      type,
      metadata,
      node: this.vfs.publicKey,
    });
    const sig = this.vfs.sign(payload);
    const packet = JSON.stringify({ payload, sig } as MeshPacket);

    let sent = 0;
    this.peers.forEach((peer) => {
      if (peer.readyState === WebSocket.OPEN) {
        peer.send(packet);
        sent++;
      }
    });
    if (sent > 0) console.log(`[MESH] Broadcast "${type}" -> ${sent} peer(s)`);
  }

  getPeerCount(): number {
    return this.peers.size;
  }

  shutdown() {
    this.peers.forEach((ws) => ws.close());
    this.server.close();
  }
}
