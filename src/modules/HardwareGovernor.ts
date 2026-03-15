import { CONFIG } from "../config";

// Soft GPIO wrapper: works on real hardware (onoff) or gracefully degrades
interface GpioPin {
  writeSync(val: number): void;
  readSync(): number;
  unexport(): void;
}

function createPin(pin: number, direction: "in" | "out"): GpioPin | null {
  try {
    // Dynamic import to avoid crash on non-GPIO platforms
    const { Gpio } = require("onoff");
    return new Gpio(pin, direction);
  } catch {
    return null;
  }
}

export class HardwareGovernor {
  private siren: GpioPin | null = null;
  private wdt: GpioPin | null = null;
  private ir: GpioPin | null = null;
  private hb: ReturnType<typeof setInterval> | null = null;
  public available = false;

  constructor() {
    try {
      this.siren = createPin(CONFIG.GPIO_SIREN, "out");
      this.wdt = createPin(CONFIG.GPIO_WATCHDOG, "out");
      this.ir = createPin(CONFIG.GPIO_IR_STROBE, "out");
      if (this.siren || this.wdt || this.ir) {
        this.available = true;
        this.hb = setInterval(
          () => this.wdt?.writeSync(this.wdt.readSync() ^ 1),
          1000
        );
        console.log("[HW] GPIO initialized.");
      } else {
        console.warn("[HW] No GPIO available — running in soft mode.");
      }
    } catch {
      console.warn("[HW] GPIO init failed — running in soft mode.");
    }
  }

  pulseIR() {
    if (this.ir) {
      this.ir.writeSync(1);
      setTimeout(() => this.ir?.writeSync(0), 10);
    }
  }

  alert() {
    if (this.siren) {
      let p = 0;
      const i = setInterval(() => {
        this.siren?.writeSync(this.siren.readSync() ^ 1);
        if (++p >= 20) {
          clearInterval(i);
          this.siren?.writeSync(0);
        }
      }, 200);
    } else {
      console.log("[HW-SOFT] 🚨 ALERT TRIGGERED (no physical siren)");
    }
  }

  kill() {
    if (this.hb) clearInterval(this.hb);
    this.siren?.unexport();
    this.wdt?.unexport();
    this.ir?.unexport();
  }
}
