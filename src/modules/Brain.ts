import axios from "axios";
import { CONFIG } from "../config";
import type { VehicleState } from "./VehicleBus";
import type { Threat } from "./GhostGrid";

export class Brain {
  async ask(telemetry: VehicleState, threats: Threat[]): Promise<string> {
    try {
      const r = await axios.post(CONFIG.OLLAMA_API, {
        model: CONFIG.OLLAMA_MODEL,
        prompt: `You are Rudolph, an AI co-pilot for a sovereign fleet truck. Current telemetry: Speed ${Math.round(telemetry.speed)} km/h, Engine temp ${Math.round(telemetry.temp)}°C, RPM ${Math.round(telemetry.rpm)}, Active threats: ${threats.length}. Give short tactical advice.`,
        stream: false,
      });
      return r.data.response;
    } catch {
      return "LLM offline — proceed with caution.";
    }
  }

  async generate(prompt: string, systemContext?: string): Promise<string> {
    try {
      const fullPrompt = systemContext
        ? `${systemContext}\n\nUser: ${prompt}`
        : prompt;
      const r = await axios.post(CONFIG.OLLAMA_API, {
        model: CONFIG.OLLAMA_MODEL,
        prompt: fullPrompt,
        stream: false,
      });
      return r.data.response;
    } catch {
      return "LLM offline — cannot process request.";
    }
  }
}
