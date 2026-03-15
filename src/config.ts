export const CONFIG = {
  IDENTITY_PATH: "./rudolph.identity",
  VEHICLE_PORT: "/dev/ttyUSB0",
  DRIVER_CAMERA: "/dev/video0",
  VFS_PATH: "./vfs",
  MODEL_PATH: "./models/fatigue/model.json",
  CHAIN_RPC: process.env.RUDOLPH_RPC || "http://localhost:8545",
  TCOIN_CONTRACT: process.env.RUDOLPH_TCOIN || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  DISPATCH_CONTRACT: process.env.RUDOLPH_DISPATCH || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  FLEET_PORT: Number(process.env.RUDOLPH_FLEET_PORT) || 8080,
  P2P_PORT: Number(process.env.RUDOLPH_P2P_PORT) || 8081,
  CRITICAL_FATIGUE_THRESHOLD: 0.15,
  PROXY_LIST: (process.env.RUDOLPH_PROXIES || "http://localhost:8888,socks5://localhost:1080").split(","),
  OLLAMA_API: process.env.RUDOLPH_OLLAMA || "http://127.0.0.1:11434/api/generate",
  OLLAMA_MODEL: process.env.RUDOLPH_MODEL || "qwen2.5:3b",
  GPIO_SIREN: 17,
  GPIO_WATCHDOG: 18,
  GPIO_IR_STROBE: 23,

  // IoT Bridge defaults
  MQTT_BROKER: process.env.RUDOLPH_MQTT || "mqtt://localhost:1883",
  IOT_HTTP_TIMEOUT: 5000,

  // Rudolph Chat
  RUDOLPH_SEARCH_API: process.env.RUDOLPH_SEARCH_API || "",
  RUDOLPH_SEARCH_KEY: process.env.RUDOLPH_SEARCH_KEY || "",
};
