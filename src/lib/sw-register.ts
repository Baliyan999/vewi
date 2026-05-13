import { flush } from "./upload-queue";

let registered = false;

export function registerServiceWorker() {
  if (
    typeof window === "undefined" ||
    registered ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }
  registered = true;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => console.warn("[sw] registration failed", err));
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "flush-queue") {
      void flush();
    }
  });
}

export async function requestBackgroundSync() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const swReg = reg as ServiceWorkerRegistration & {
    sync?: { register: (tag: string) => Promise<void> };
  };
  if (swReg.sync) {
    try {
      await swReg.sync.register("qr-photo-queue-flush");
    } catch (err) {
      console.warn("[sw] sync register failed", err);
    }
  }
}
