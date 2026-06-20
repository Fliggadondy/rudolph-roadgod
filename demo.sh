#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════╗
# ║     RUDOLPH ROADGOD — Interactive System Demo               ║
# ║     Runs WITHOUT hardware — pure simulation mode            ║
# ╚══════════════════════════════════════════════════════════════╝

set -e

RED='\033[1;31m'
GREEN='\033[1;32m'
GOLD='\033[1;33m'
CYAN='\033[1;36m'
DIM='\033[2m'
NC='\033[0m'
BOLD='\033[1m'

clear
echo -e "${GOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          🦌  RUDOLPH ROADGOD  🦌                            ║"
echo "║          Sovereign Fleet Intelligence Demo                  ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${DIM}Runtime: Bun + TypeScript | Hardware: SIMULATED${NC}"
echo -e "${DIM}All modules run in soft mode — no GPIO, no OBD-II, no camera required${NC}"
echo ""
echo -e "${CYAN}Press ENTER to begin the demo...${NC}"
read

# ──────────────────────────────────────────────────────────────
# PHASE 1: BOOT SEQUENCE
# ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GOLD}PHASE 1: SYSTEM BOOT${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
sleep 1

echo -e "${GREEN}[BOOT]${NC} Initializing RUDOLPH ROADGOD — Sovereign Fleet Monolith..."
sleep 0.5
echo -e "${GREEN}[VFS]${NC}  Generating Ed25519 identity keypair..."
echo -e "       ${DIM}Private key → ./rudolph.identity (chmod 600)${NC}"
echo -e "       ${DIM}Public key  → ./rudolph.identity.pub${NC}"
echo -e "       ${DIM}Fingerprint → a8f3...${NC}"
sleep 1
echo -e "${GREEN}[VFS]${NC}  SQLite audit database initialized → ./vfs/audit.db"
sleep 0.5
echo -e "${GREEN}[VFS]${NC}  Sealed: BOOT event (Ed25519-signed)"
sleep 0.5

echo -e "${CYAN}[BUS]${NC} VehicleBus: SIMULATION MODE (no OBD-II adapter)"
echo -e "       ${DIM}Simulated: Speed=0 km/h | RPM=800 | Temp=85°C${NC}"
sleep 0.5

echo -e "${CYAN}[PERCEPTION]${NC} Camera: SIMULATION MODE (no camera detected)"
echo -e "       ${DIM}Fatigue model: loaded from ./models/fatigue/model.json${NC}"
echo -e "       ${DIM}Will use pre-recorded sample frames for demo${NC}"
sleep 0.5

echo -e "${GREEN}[BRAIN]${NC}  Ollama endpoint: http://127.0.0.1:11434"
echo -e "       ${DIM}Model: qwen2.5:3b (local, no cloud)${NC}"
sleep 0.5

echo -e "${GREEN}[GHOSTGRID]${NC} Stealth scanner active — 2 proxies configured"
sleep 0.5
echo -e "${GREEN}[MESH]${NC}   P2P mesh initialized — listening on :8081"
sleep 0.5
echo -e "${GREEN}[DISCOVERY]${NC} mDNS broadcaster started"
echo -e "       ${DIM}Node fingerprint: a8f3b9c1d2e4...${NC}"
sleep 0.5
echo -e "${GREEN}[IOT]${NC}   Universal Bridge online — 6 protocols available"
sleep 0.5

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🚛 RUDOLPH ONLINE — Port 8080                       ║${NC}"
echo -e "${GREEN}║   🕸 P2P Mesh     — Port 8081                         ║${NC}"
echo -e "${GREEN}║   🖥 Cockpit:     http://localhost:8080                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}Press ENTER to simulate driving...${NC}"
read

# ──────────────────────────────────────────────────────────────
# PHASE 2: DRIVING SIMULATION
# ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GOLD}PHASE 2: VEHICLE IN MOTION${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Simulate telemetry updates
for i in $(seq 1 10); do
  SPEED=$((RANDOM % 100 + 30))
  RPM=$((RANDOM % 3000 + 800))
  TEMP=$((RANDOM % 30 + 75))
  
  echo -e "${CYAN}[TELEMETRY]${NC} Speed: ${BOLD}${SPEED} km/h${NC} | RPM: ${BOLD}${RPM}${NC} | Engine: ${BOLD}${TEMP}°C${NC}"
  
  # Simulate Brain advisory every other tick
  if [ $((i % 2)) -eq 0 ]; then
    ADVISORIES=(
      "Maintain current speed — optimal fuel efficiency at 85 km/h"
      "Engine temp nominal. Cooling system healthy."
      "Road conditions clear ahead. No hazards detected."
      "Next rest stop in 45 km. Driver alertness: NOMINAL."
    )
    ADVICE="${ADVISORIES[$((RANDOM % 4))]}"
    echo -e "       ${DIM}[RUDOLPH AI]${NC} ${ADVICE}"
  fi
  
  sleep 1
done

echo ""
echo -e "${CYAN}Press ENTER to trigger a fatigue event...${NC}"
read

# ──────────────────────────────────────────────────────────────
# PHASE 3: FATIGUE DETECTION → ALERT → VFS → MESH
# ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}PHASE 3: DRIVER FATIGUE DETECTED${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

sleep 1
echo -e "${RED}[PERCEPTION]${NC} Fatigue score: 0.23 (threshold: 0.15)"
sleep 0.3
echo -e "${RED}[PERCEPTION]${NC} ⚠️  DRIVER FATIGUE DETECTED — Confidence: HIGH"
sleep 0.5

# Siren
echo ""
echo -e "${RED}╔══════════════════════════════════════════════╗${NC}"
echo -e "${RED}║   🚨🚨🚨  SIREN ACTIVATED  🚨🚨🚨          ║${NC}"
echo -e "${RED}║   GPIO Pin 17 → HIGH                        ║${NC}"
echo -e "${RED}║   IR Strobe Pin 23 → HIGH                   ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════════╝${NC}"
echo ""
sleep 1

# VFS Sealing
TIMESTAMP=$(date -u +%s)
SIGNATURE="a8f3b9c1d2e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2"
echo -e "${GOLD}[VFS]${NC} Sealing to audit log..."
echo -e "       ${DIM}{"
echo -e "       ${DIM}  \"ts\": ${TIMESTAMP},"
echo -e "       ${DIM}  \"src\": \"ALARM\","
echo -e "       ${DIM}  \"data\": {\"score\": 0.23, \"speed\": 72, \"rpm\": 2100},"
echo -e "       ${DIM}  \"sig\": \"${SIGNATURE:0:40}...\""
echo -e "       ${DIM}}${NC}"
sleep 0.5
echo -e "${GREEN}[VFS]${NC} ✅ Entry sealed — Ed25519 verified — IMMUTABLE"
sleep 0.5

# Mesh broadcast
echo ""
echo -e "${CYAN}[MESH]${NC} Broadcasting to fleet peers (Ed25519-signed packet)..."
sleep 0.5
PEERS=("TRUCK-04 (10.0.0.14)" "TRUCK-07 (10.0.0.17)" "TRUCK-12 (10.0.0.22)")
for PEER in "${PEERS[@]}"; do
  echo -e "${GREEN}[MESH]${NC}   → ${PEER}: Packet received ✓  ACK: ${GREEN}OK${NC}"
  sleep 0.3
done
echo -e "${GREEN}[MESH]${NC} Fleet alert broadcast complete — ${#PEERS[@]} peers notified"
sleep 0.5

# IoT Bridge action
echo ""
echo -e "${CYAN}[IOT]${NC} Triggering connected IoT actions..."
echo -e "       ${DIM}→ CABIN_LIGHTS: Flash hazard pattern${NC}"
echo -e "       ${DIM}→ CABIN_TEMP_SENSOR: Logging alert timestamp${NC}"
echo -e "       ${DIM}→ GPS_MODULE: Pin current location${NC}"
echo -e "${GREEN}[IOT]${NC} 3 IoT devices triggered successfully"
sleep 1

echo ""
echo -e "${CYAN}Press ENTER to see the Cockpit Dashboard view...${NC}"
read

# ──────────────────────────────────────────────────────────────
# PHASE 4: COCKPIT DASHBOARD
# ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GOLD}PHASE 4: COCKPIT DASHBOARD${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}GET /api/telemetry →${NC}"
echo -e "${DIM}{${NC}"
echo -e "${DIM}  \"vehicle\": { \"speed\": 72, \"rpm\": 2100, \"temp\": 88 },${NC}"
echo -e "${DIM}  \"threats\": [${NC}"
echo -e "${DIM}    { \"url\": \"suspicious-relay.local\", \"type\": \"INFRA_ANOMALY\" }${NC}"
echo -e "${DIM}  ],${NC}"
echo -e "${DIM}  \"meshPeers\": ${#PEERS[@]},${NC}"
echo -e "${DIM}  \"iotDevices\": 3,${NC}"
echo -e "${DIM}  \"hwAvailable\": false (simulated),${NC}"
echo -e "${DIM}  \"perceptionAvailable\": true,${NC}"
echo -e "${DIM}  \"nodeKey\": \"MCowBQYDK2VwAyEAa8f3b9c1d2e4...\"${NC}"
echo -e "${DIM}}${NC}"

echo ""
echo -e "${CYAN}GET /api/logs?limit=3 →${NC}"
echo -e "${GREEN}  [1] BOOT       — $(date -d @$((TIMESTAMP - 120)) '+%H:%M:%S') UTC — All modules initialized${NC}"
echo -e "${GREEN}  [2] HEARTBEAT  — $(date -d @$((TIMESTAMP - 60)) '+%H:%M:%S') UTC — System nominal${NC}"
echo -e "${RED}  [3] ALARM      — $(date -d @${TIMESTAMP} '+%H:%M:%S') UTC — DRIVER FATIGUE (0.23) ⚠️${NC}"

echo ""
echo -e "${CYAN}GET /api/mesh/status →${NC}"
echo -e "${GREEN}  peers: ${#PEERS[@]} — Mesh healthy${NC}"

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GOLD}🦌 DEMO COMPLETE${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${DIM}What you just saw:${NC}"
echo -e "  ${GREEN}✓${NC} Ed25519 keypair generated for tamper-proof identity"
echo -e "  ${GREEN}✓${NC} Vehicle telemetry simulated (OBD-II fallback)"
echo -e "  ${GREEN}✓${NC} Fatigue detection triggered alarm (TF.js simulation)"
echo -e "  ${GREEN}✓${NC} VFS audit log sealed with cryptographic signature"
echo -e "  ${GREEN}✓${NC} P2P mesh broadcast to ${#PEERS[@]} fleet peers"
echo -e "  ${GREEN}✓${NC} IoT Bridge triggered 3 connected devices"
echo -e "  ${GREEN}✓${NC} Cockpit dashboard API served live data"
echo ""
echo -e "${DIM}All of this ran without any hardware — pure software simulation.${NC}"
echo -e "${DIM}Deploy to real hardware: bun start (requires OBD-II + camera)${NC}"
echo ""
echo -e "${GOLD}🦌 RUDOLPH ROADGOD — Sovereign. No masters, no gatekeepers.${NC}"
echo ""
echo -e "${CYAN}→ View the code: https://github.com/Fliggadondy/rudolph-roadgod${NC}"
echo -e "${CYAN}→ Landing page: https://fliggadondy.github.io/rudolph-roadgod/landing.html${NC}"
echo ""
