import mqtt from "mqtt";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.development.local" });

console.log("[Worker] MQTT to Supabase worker starting...");

type PacketType = "warning" | "keepalive";

type RailwayMqttPayload = {
  device_id?: string;
  packet_type?: PacketType;
  status?: string;

  anomaly_score?: number;
  idle_prob?: number;
  normal_prob?: number;

  lat?: number | null;
  lng?: number | null;
  speed_kmh?: number | null;

  device_time?: string;
};

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function hasValidLocation(lat: number | null, lng: number | null): boolean {
  if (lat === null || lng === null) {
    return false;
  }

  if (lat < -90 || lat > 90) {
    return false;
  }

  if (lng < -180 || lng > 180) {
    return false;
  }

  if (lat === 0 && lng === 0) {
    return false;
  }

  return true;
}

function normalizeDeviceTime(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed === "N/A") {
    return null;
  }

  // Chuẩn hóa trường hợp ESP32 gửi thiếu khoảng trắng: "25/06/2026 -00:54:04"
  return trimmed.replace(/\s*-\s*/, " - ");
}

function buildSupabaseRow(payload: RailwayMqttPayload) {
  if (!payload.device_id) {
    throw new Error("Missing device_id");
  }

  if (payload.packet_type !== "warning" && payload.packet_type !== "keepalive") {
    throw new Error("Invalid packet_type");
  }

  const lat = toNumber(payload.lat);
  const lng = toNumber(payload.lng);
  const speedKmh = toNumber(payload.speed_kmh);

  const locationIsValid = hasValidLocation(lat, lng);

  return {
    device_id: payload.device_id,
    packet_type: payload.packet_type,

    status: payload.status ?? null,

    anomaly_score: toNumber(payload.anomaly_score),
    idle_prob: toNumber(payload.idle_prob),
    normal_prob: toNumber(payload.normal_prob),

    lat: locationIsValid ? lat : null,
    lng: locationIsValid ? lng : null,
    speed_kmh: locationIsValid ? speedKmh : null,

    device_time: normalizeDeviceTime(payload.device_time),
  };
}

const MQTT_URL = getEnv("MQTT_URL");
const MQTT_USERNAME = getEnv("MQTT_USERNAME");
const MQTT_PASSWORD = getEnv("MQTT_PASSWORD");
const MQTT_TOPIC = process.env.MQTT_TOPIC || "RailWay/AI";

const SUPABASE_URL = getEnv("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
const SUPABASE_TABLE = process.env.SUPABASE_TABLE || "dataTracking";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const mqttClient = mqtt.connect(MQTT_URL, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  clientId: `railway_worker_${Date.now()}`,
  clean: true,
  reconnectPeriod: 5000,
  connectTimeout: 30000,
});

mqttClient.on("connect", () => {
  console.log("[MQTT] Connected to HiveMQ");

  mqttClient.subscribe(MQTT_TOPIC, (error) => {
    if (error) {
      console.error("[MQTT] Subscribe failed:", error.message);
      return;
    }

    console.log(`[MQTT] Subscribed topic: ${MQTT_TOPIC}`);
  });
});

mqttClient.on("reconnect", () => {
  console.log("[MQTT] Reconnecting...");
});

mqttClient.on("close", () => {
  console.log("[MQTT] Connection closed");
});

mqttClient.on("offline", () => {
  console.log("[MQTT] Offline");
});

mqttClient.on("error", (error) => {
  console.error("[MQTT] Error:", error.message);
});

mqttClient.on("message", async (topic, message, packet) => {
  try {
    const rawPayload = message.toString();

    console.log("[MQTT] Topic:", topic);
    console.log("[MQTT] Retained:", packet.retain);
    console.log("[MQTT] Payload:", rawPayload);

    if (packet.retain) {
      console.warn("[MQTT] Skip retained message");
      return;
    }

    if (!rawPayload.trim()) {
      console.warn("[MQTT] Skip empty payload");
      return;
    }

    const payload = JSON.parse(rawPayload) as RailwayMqttPayload;

    if (!payload.packet_type) {
      console.warn("[MQTT] Skip legacy payload: missing packet_type");
      return;
    }

    const row = buildSupabaseRow(payload);

    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .insert(row);

    if (error) {
      console.error("[Supabase] Insert failed:", error.message);
      return;
    }

    console.log("[Supabase] Insert success:", row.packet_type);
  } catch (error) {
    if (error instanceof Error) {
      console.error("[Worker] Error:", error.message);
    } else {
      console.error("[Worker] Unknown error:", error);
    }
  }
});

process.on("SIGINT", () => {
  console.log("\n[Worker] Stopping...");

  mqttClient.end(true, () => {
    console.log("[MQTT] Disconnected");
    process.exit(0);
  });
});
