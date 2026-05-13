import FingerprintJS from "@fingerprintjs/fingerprintjs";

const STORAGE_KEY = "qr-photo-device-id";

let cached: Promise<string> | null = null;

export function getDeviceId(): Promise<string> {
  if (typeof window === "undefined") {
    return Promise.resolve("ssr");
  }
  if (cached) return cached;

  cached = (async () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const fp = await FingerprintJS.load();
    const { visitorId } = await fp.get();
    localStorage.setItem(STORAGE_KEY, visitorId);
    return visitorId;
  })();

  return cached;
}
