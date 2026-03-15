import { spawn, type ChildProcess } from "child_process";
import { CONFIG } from "../config";
import type { HardwareGovernor } from "./HardwareGovernor";

export class Perception {
  private model: any = null;
  private tf: any = null;
  private ffmpeg: ChildProcess | null = null;
  public lastPulse = Date.now();
  public available = false;

  constructor(private hw: HardwareGovernor) {}

  async init() {
    try {
      this.tf = await import("@tensorflow/tfjs-node");
      this.model = await this.tf.loadLayersModel(
        `file://${CONFIG.MODEL_PATH}`
      );
      this.available = true;
      console.log("[PERCEPTION] Fatigue model loaded.");
    } catch {
      console.warn(
        "[PERCEPTION] No fatigue model found — perception disabled."
      );
    }
  }

  async start(onFatigue: (score: number) => void) {
    try {
      this.ffmpeg = spawn("ffmpeg", [
        "-i", CONFIG.DRIVER_CAMERA,
        "-vf", "fps=5,scale=224:224",
        "-f", "image2pipe",
        "-vcodec", "mjpeg",
        "-",
      ]);

      let buffer = Buffer.alloc(0);
      const SOI = Buffer.from([0xff, 0xd8]);
      const EOI = Buffer.from([0xff, 0xd9]);

      this.ffmpeg.stdout?.on("data", async (chunk: Buffer) => {
        this.hw.pulseIR();
        buffer = Buffer.concat([buffer, chunk]);

        const start = buffer.indexOf(SOI);
        const end = buffer.indexOf(EOI);

        if (start !== -1 && end !== -1 && end > start) {
          const frame = buffer.subarray(start, end + 2);
          buffer = buffer.subarray(end + 2);
          this.lastPulse = Date.now();

          if (this.model && this.tf) {
            this.tf.tidy(() => {
              const tensor = this.tf.node
                .decodeImage(frame, 3)
                .resizeBilinear([224, 224])
                .expandDims(0)
                .div(255);
              const prediction = this.model.predict(tensor);
              prediction.data().then((data: Float32Array) => {
                if (data[0] > CONFIG.CRITICAL_FATIGUE_THRESHOLD) {
                  onFatigue(data[0]);
                }
              });
            });
          }
        }
      });

      this.ffmpeg.stderr?.on("data", () => {});
      this.ffmpeg.on("error", () => {
        console.warn("[PERCEPTION] ffmpeg not available — camera offline.");
      });

      console.log("[PERCEPTION] Camera stream started.");
    } catch {
      console.warn("[PERCEPTION] Could not start camera stream.");
    }
  }

  stop() {
    this.ffmpeg?.kill("SIGTERM");
  }
}
