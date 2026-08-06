"use client";

import { isNativePlatform } from "./platform";

export type AccelData = { x: number; y: number; z: number; interval: number };
export type OrientData = { alpha: number; beta: number; gamma: number };
export type GeoData = { lat: number; lng: number; accuracy: number };
export type BatteryData = { level: number; charging: boolean };
export type BrightnessData = { brightness: number | null };
export type DeviceInfoData = { model: string; osVersion: string; platform: string };
export type NetworkData = { type: string };

export type SensorSubscription = { unsubscribe: () => void };

export async function subscribeAcceleration(cb: (d: AccelData) => void): Promise<SensorSubscription> {
  if (isNativePlatform()) {
    const { Motion } = await import("@capacitor/motion");
    const handle = await Motion.addListener("accel", (event) => {
      const ev = event as unknown as { x?: number; y?: number; z?: number };
      cb({ x: ev.x ?? 0, y: ev.y ?? 0, z: ev.z ?? 0, interval: 0 });
    });
    return { unsubscribe: () => handle.remove() };
  }
  const handler = (e: DeviceMotionEvent) => {
    const acc = (e.accelerationIncludingGravity || e.acceleration) as { x: number | null; y: number | null; z: number | null } | null;
    cb({ x: acc?.x || 0, y: acc?.y || 0, z: acc?.z || 0, interval: e.interval || 0 });
  };
  window.addEventListener("devicemotion", handler);
  return { unsubscribe: () => window.removeEventListener("devicemotion", handler) };
}

export async function subscribeOrientation(cb: (d: OrientData) => void): Promise<SensorSubscription> {
  if (isNativePlatform()) {
    const { Motion } = await import("@capacitor/motion");
    const handle = await Motion.addListener("orientation", (event) => {
      const ev = event as unknown as { alpha?: number; beta?: number; gamma?: number };
      cb({ alpha: ev.alpha ?? 0, beta: ev.beta ?? 0, gamma: ev.gamma ?? 0 });
    });
    return { unsubscribe: () => handle.remove() };
  }
  const handler = (e: DeviceOrientationEvent) => {
    cb({ alpha: e.alpha || 0, beta: e.beta || 0, gamma: e.gamma || 0 });
  };
  window.addEventListener("deviceorientation", handler);
  return { unsubscribe: () => window.removeEventListener("deviceorientation", handler) };
}

export async function getGeolocation(): Promise<GeoData | null> {
  try {
    if (isNativePlatform()) {
      const { Geolocation } = await import("@capacitor/geolocation");
      const pos = await Geolocation.getCurrentPosition();
      return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
    }
    return await new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        () => resolve(null),
        { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
      );
    });
  } catch { return null; }
}

export async function getBatteryState(): Promise<BatteryData | null> {
  try {
    if (isNativePlatform()) {
      const { Device } = await import("@capacitor/device");
      const info = await Device.getBatteryInfo();
      return { level: info.batteryLevel ?? -1, charging: info.isCharging ?? false };
    }
    if ("getBattery" in navigator) {
      const battery = await (navigator as any).getBattery();
      return { level: battery.level, charging: battery.charging };
    }
    return null;
  } catch { return null; }
}

export async function getScreenBrightness(): Promise<BrightnessData> {
  try {
    if (isNativePlatform()) {
      const { ScreenBrightness } = await import("@capacitor-community/screen-brightness");
      const result = await ScreenBrightness.getBrightness();
      return { brightness: result.brightness };
    }
  } catch {}
  try {
    if (typeof window !== "undefined" && "AmbientLightSensor" in window) {
      const sensor = new (window as any).AmbientLightSensor();
      return await new Promise<BrightnessData>((resolve) => {
        const timeoutId = setTimeout(() => {
          try { sensor.stop(); } catch {}
          resolve({ brightness: null });
        }, 3000);
        sensor.addEventListener("reading", () => {
          clearTimeout(timeoutId);
          try { sensor.stop(); } catch {}
          const lux = sensor.illuminance || 0;
          const brightness = Math.min(1, Math.max(0, lux / 1000));
          resolve({ brightness });
        });
        sensor.addEventListener("error", () => {
          clearTimeout(timeoutId);
          resolve({ brightness: null });
        });
        sensor.start();
      });
    }
  } catch {}
  return { brightness: null };
}

export async function getDeviceInfo(): Promise<DeviceInfoData> {
  try {
    if (isNativePlatform()) {
      const { Device } = await import("@capacitor/device");
      const info = await Device.getInfo();
      return { model: info.model || "unknown", osVersion: info.osVersion || "unknown", platform: info.platform || "unknown" };
    }
  } catch {}
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
  const uaData = (navigator as any).userAgentData;
  let model = "browser";
  let osVersion = "unknown";
  // Try high-entropy UA Client Hints first (APK-like data: real model + OS version)
  if (uaData?.getHighEntropyValues) {
    try {
      const hev = await uaData.getHighEntropyValues(["model", "platformVersion"]);
      if (hev.model) model = hev.model;
      if (hev.platformVersion) osVersion = hev.platformVersion;
    } catch {}
  }
  // Fall back to UA string parsing if high-entropy didn't provide values
  if (model === "browser" && osVersion === "unknown") {
    if (/Android/.test(ua)) {
      const modelMatch = ua.match(/;\s([^;)]+?)\s+Build\//);
      if (modelMatch) model = modelMatch[1].trim();
      else model = "Android";
      const m = ua.match(/Android\s([\d.]+)/); osVersion = m?.[1] || "unknown";
    }
    else if (/iPhone|iPad/.test(ua)) {
      const iMatch = ua.match(/(iPhone|iPad)/); model = iMatch?.[1] || "iOS";
      const m = ua.match(/OS\s([\d_]+)/); osVersion = m?.[1]?.replace(/_/g, ".") || "unknown";
    }
    else if (/Windows/.test(ua)) { model = "Windows PC"; const m = ua.match(/Windows NT\s([\d.]+)/); osVersion = m?.[1] || "unknown"; }
    else if (/Macintosh/.test(ua)) { model = "Mac"; const m = ua.match(/Mac OS X\s([\d_]+)/); osVersion = m?.[1]?.replace(/_/g, ".") || "unknown"; }
  }
  return { model, osVersion, platform: "web" };
}

export async function getNetworkType(): Promise<NetworkData> {
  try {
    if (isNativePlatform()) {
      const { Network } = await import("@capacitor/network");
      const status = await Network.getStatus();
      return { type: status.connectionType || "unknown" };
    }
  } catch {}
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (conn?.type) return { type: conn.type };
  if (conn?.effectiveType) return { type: conn.effectiveType };
  return { type: "unknown" };
}
