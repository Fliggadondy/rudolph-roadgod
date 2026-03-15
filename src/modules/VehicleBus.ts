import { existsSync } from "fs";
import { CONFIG } from "../config";

export interface VehicleState {
  rpm: number;
  temp: number;
  speed: number;
  connected: boolean;
}

export class VehicleBus {
  public state: VehicleState = { rpm: 0, temp: 0, speed: 0, connected: false };
  private port: any = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  async connect() {
    try {
      if (!existsSync(CONFIG.VEHICLE_PORT)) {
        throw new Error(`Serial device not found: ${CONFIG.VEHICLE_PORT}`);
      }

      const { SerialPort } = await import("serialport");
      const { ReadlineParser } = await import("@serialport/parser-readline");

      this.port = new SerialPort({
        path: CONFIG.VEHICLE_PORT,
        baudRate: 115200,
      });
      const parser = this.port.pipe(new ReadlineParser({ delimiter: "\r" }));

      parser.on("data", (line: string) => {
        this.parseOBD(line);
      });

      this.state.connected = true;
      this.pollTimer = setInterval(() => {
        this.port?.write("010C\r0105\r010D\r");
      }, 2000);

      console.log("[BUS] Connected to vehicle OBD-II.");
    } catch {
      console.warn("[BUS] No serial port — running in simulation mode.");
      this.startSimulation();
    }
  }

  private parseOBD(line: string) {
    if (line.includes("41 0C")) {
      this.state.rpm =
        parseInt(line.split(" ").slice(2, 4).join(""), 16) / 4;
    }
    if (line.includes("41 05")) {
      this.state.temp = parseInt(line.split(" ")[2], 16) - 40;
    }
    if (line.includes("41 0D")) {
      this.state.speed = parseInt(line.split(" ")[2], 16);
    }
  }

  private startSimulation() {
    this.state.connected = false;
    this.pollTimer = setInterval(() => {
      this.state.rpm = 800 + Math.random() * 3000;
      this.state.temp = 70 + Math.random() * 30;
      this.state.speed = Math.random() * 120;
    }, 2000);
  }

  disconnect() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.port?.close();
  }
}
