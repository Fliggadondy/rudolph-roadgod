import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { CONFIG } from "../config";

export interface Threat {
  url: string;
  ts: number;
  type?: string;
  metadata?: Record<string, unknown>;
}

type ThreatHandler = (threat: Threat) => void;

export class GhostGrid {
  public threats: Threat[] = [];
  private handlers: ThreatHandler[] = [];

  onThreatDetected(fn: ThreatHandler) {
    this.handlers.push(fn);
  }

  async scan(url: string) {
    try {
      const proxy = CONFIG.PROXY_LIST[Math.floor(Math.random() * CONFIG.PROXY_LIST.length)];
      await axios.get(url, {
        httpsAgent: new HttpsProxyAgent(proxy),
        timeout: 3000,
      });
      if (Math.random() > 0.98) {
        const threat: Threat = { url, ts: Date.now(), type: "INFRA_ANOMALY" };
        this.threats.push(threat);
        this.handlers.forEach((fn) => fn(threat));
      }
    } catch {
      // Silent failure — stealth scanning
    }
  }

  addThreat(threat: Threat) {
    this.threats.push(threat);
    this.handlers.forEach((fn) => fn(threat));
  }

  getRecent(count = 10): Threat[] {
    return this.threats.slice(-count);
  }
}
