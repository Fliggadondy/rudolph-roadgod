import type { RudolphMesh } from "./Mesh";
import { CONFIG } from "../config";

const SERVICE_TYPE = "rudolph";
const KNOWN_PEERS = new Set<string>();

export class Discovery {
  private bonjour: any = null;
  private browser: any = null;

  constructor(private mesh: RudolphMesh) {}

  async start(nodeId: string) {
    try {
      const BonjourModule = await import("bonjour-service");
      const Bonjour = BonjourModule.default ?? BonjourModule.Bonjour;
      this.bonjour = new Bonjour();

      // Announce this node on the subnet
      this.bonjour.publish({
        name: `rudolph-${nodeId}`,
        type: SERVICE_TYPE,
        port: CONFIG.P2P_PORT,
      });

      // Watch for other Rudolph nodes
      this.browser = this.bonjour.find(
        { type: SERVICE_TYPE },
        (svc: any) => {
          this._onFound(svc);
        }
      );

      console.log(
        `[DISCOVERY] Advertising _${SERVICE_TYPE}._tcp :${CONFIG.P2P_PORT}`
      );
    } catch {
      console.warn("[DISCOVERY] mDNS unavailable — manual peering only.");
    }
  }

  private _onFound(svc: any) {
    const addr = svc.addresses?.[0] ?? svc.host;
    const key = `${addr}:${svc.port}`;

    if (KNOWN_PEERS.has(key)) return;
    KNOWN_PEERS.add(key);

    console.log(`[DISCOVERY] Found peer: ${svc.name} @ ${addr}`);
    this.mesh.connect(addr);
  }

  stop() {
    this.browser?.stop();
    this.bonjour?.unpublishAll();
    this.bonjour?.destroy();
  }
}
