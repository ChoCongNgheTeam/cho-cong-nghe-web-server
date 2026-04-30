/**
 *
 * Parses raw userAgent string and IP address into human-readable
 * session metadata stored on refresh_tokens rows.
 *
 * Dependencies (add to package.json):
 *   npm install ua-parser-js geoip-lite
 *   npm install --save-dev @types/ua-parser-js @types/geoip-lite
 */

import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";

export interface SessionMeta {
  userAgent?: string;
  ip?: string;
  deviceName?: string;
  browser?: string;
  location?: string;
}

/**
 * Given a raw userAgent string and/or IP, return enriched labels
 * suitable for storing in refresh_tokens.
 *
 * Examples:
 *   browser    → "Chrome 124 / Windows"
 *   deviceName → "iPhone 15" | "Desktop" | "Samsung Galaxy S23"
 *   location   → "Ho Chi Minh City, VN"
 */
export function buildSessionMeta(userAgent?: string, ip?: string): SessionMeta {
  const meta: SessionMeta = { userAgent, ip };

  // ── Parse User-Agent ──────────────────────────────────────────────────────
  if (userAgent) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // browser: "Chrome 124 / Windows 10"
    const browserName = result.browser.name ?? "Unknown Browser";
    const browserVersion = result.browser.major ?? "";
    const osName = result.os.name ?? "";
    const osVersion = result.os.version ?? "";
    const osLabel = osVersion ? `${osName} ${osVersion}` : osName;

    meta.browser = [browserName, browserVersion].filter(Boolean).join(" ") + (osLabel ? ` / ${osLabel}` : "");

    // deviceName: model if available (phones/tablets), else device type, else "Desktop"
    const model = result.device.model; // e.g. "iPhone", "Galaxy S23"
    const vendor = result.device.vendor; // e.g. "Apple", "Samsung"
    const deviceType = result.device.type; // "mobile" | "tablet" | "console" | undefined

    if (model) {
      meta.deviceName = vendor ? `${vendor} ${model}` : model;
    } else if (deviceType) {
      // Capitalize first letter
      meta.deviceName = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
    } else {
      meta.deviceName = "Desktop";
    }
  }

  // ── Parse IP → Location ───────────────────────────────────────────────────
  if (ip) {
    // Strip IPv6-mapped IPv4 prefix (e.g. "::ffff:127.0.0.1" → "127.0.0.1")
    const cleanIp = ip.replace(/^::ffff:/, "");

    const geo = geoip.lookup(cleanIp);
    if (geo) {
      const parts: string[] = [];
      if (geo.city) parts.push(geo.city);
      if (geo.country) parts.push(geo.country);
      meta.location = parts.join(", ");
    }
    // Loopback / private IPs return null from geoip — leave location undefined
  }

  return meta;
}
