export type PaymentProvider = "click" | "payme" | "cash" | "transfer";

export type CheckoutInput = {
  eventId: string;
  tariff: "basic" | "pro" | "premium";
  amountUzs: number;
  couplePhone: string;
  referralCode?: string;
};

export type CheckoutResult =
  | { ok: true; redirectUrl: string; orderId: string }
  | { ok: false; error: string };

export type PaymentProviderAdapter = {
  name: PaymentProvider;
  startCheckout: (input: CheckoutInput & { orderId: string }) => Promise<CheckoutResult>;
  verifyWebhook: (body: unknown, headers: Headers) => Promise<{
    valid: boolean;
    orderId?: string;
    amountUzs?: number;
    providerRef?: string;
  }>;
};
