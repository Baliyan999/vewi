import type { PaymentProvider, PaymentProviderAdapter } from "./types";
import { clickAdapter } from "./click";
import { paymeAdapter } from "./payme";

const adapters: Record<PaymentProvider, PaymentProviderAdapter | null> = {
  click: clickAdapter,
  payme: paymeAdapter,
  cash: null,
  transfer: null,
};

export function getProvider(p: PaymentProvider): PaymentProviderAdapter | null {
  return adapters[p];
}
