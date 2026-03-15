import { Database } from "bun:sqlite";
import { createSign, createVerify, generateKeyPairSync } from "crypto";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { CONFIG } from "../config";

export class RUDOLPH_VFS {
  private db: Database;
  private privateKey: string;
  public publicKey: string;

  constructor() {
    mkdirSync(CONFIG.VFS_PATH, { recursive: true });
    this.db = new Database(join(CONFIG.VFS_PATH, "audit.db"));
    this.db.run(
      `CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, ts INT, src TEXT, data TEXT, sig TEXT);`
    );

    const pubPath = CONFIG.IDENTITY_PATH + ".pub";

    if (existsSync(CONFIG.IDENTITY_PATH)) {
      this.privateKey = readFileSync(CONFIG.IDENTITY_PATH, "utf8");
      this.publicKey = readFileSync(pubPath, "utf8");
    } else {
      const { privateKey, publicKey } = generateKeyPairSync("ed25519");
      this.privateKey = privateKey
        .export({ type: "pkcs8", format: "pem" })
        .toString();
      this.publicKey = publicKey
        .export({ type: "spki", format: "pem" })
        .toString();
      writeFileSync(CONFIG.IDENTITY_PATH, this.privateKey, { mode: 0o600 });
      writeFileSync(pubPath, this.publicKey, { mode: 0o644 });
    }
  }

  seal(src: string, data: object) {
    const ts = Date.now();
    const payload = JSON.stringify({ ts, src, data });
    const sig = this.sign(payload);
    this.db.run(
      `INSERT INTO logs (ts, src, data, sig) VALUES (?, ?, ?, ?)`,
      [ts, src, payload, sig]
    );
  }

  sign(payload: string): string {
    return createSign("SHA256")
      .update(payload)
      .sign(this.privateKey, "hex");
  }

  verify(sig: string, payload: string, remotePubKey?: string): boolean {
    try {
      return createVerify("SHA256")
        .update(payload)
        .verify(remotePubKey ?? this.publicKey, sig, "hex");
    } catch {
      return false;
    }
  }

  queryLogs(limit = 50): Array<{ id: number; ts: number; src: string; data: string; sig: string }> {
    return this.db
      .query(`SELECT * FROM logs ORDER BY ts DESC LIMIT ?`)
      .all(limit) as Array<{ id: number; ts: number; src: string; data: string; sig: string }>;
  }
}
