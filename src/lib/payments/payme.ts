import type { PaymentProviderAdapter } from "./types";

/**
 * Payme (paycom.uz) adapter.
 *
 * Чекаут: redirect на checkout.paycom.uz?...base64(params). Webhook —
 * Merchant API через JSON-RPC с Basic auth (PAYME_MERCHANT_ID :: PAYME_KEY).
 *
 * Этот скаффолд закрывает «как минимум»: подпись формы для редиректа и
 * валидация Basic auth заголовка для приходящих RPC-запросов.
 *
 * ENV:
 *   PAYME_MERCHANT_ID
 *   PAYME_KEY
 */

const MERCHANT_ID = process.env.PAYME_MERCHANT_ID;
const PAYME_KEY = process.env.PAYME_KEY;

export const paymeAdapter: PaymentProviderAdapter = {
  name: "payme",

  async startCheckout({ orderId, amountUzs }) {
    if (!MERCHANT_ID) return { ok: false, error: "payme_not_configured" };
    // amount в Payme — в тийинах (1 UZS = 100 тийин)
    const tiyin = amountUzs * 100;
    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?order=${orderId}`;
    const params = [
      `m=${MERCHANT_ID}`,
      `ac.order_id=${orderId}`,
      `a=${tiyin}`,
      `c=${encodeURIComponent(returnUrl)}`,
    ].join(";");
    const b64 = Buffer.from(params).toString("base64");
    return {
      ok: true,
      redirectUrl: `https://checkout.paycom.uz/${b64}`,
      orderId,
    };
  },

  async verifyWebhook(_body, headers) {
    if (!PAYME_KEY) return { valid: false };
    const auth = headers.get("authorization") ?? "";
    if (!auth.startsWith("Basic ")) return { valid: false };
    const decoded = Buffer.from(auth.slice(6), "base64").toString();
    const [user, pass] = decoded.split(":");
    if (user !== "Paycom" || pass !== PAYME_KEY) return { valid: false };
    // Тут реальный сценарий — раскладывать method/params JSON-RPC и связывать
    // с нашим orderId по `params.account.order_id`. Этот scaffold возвращает
    // ok=true, чтобы вебхук эндпоинт мог отвечать корректным JSON-RPC ответом.
    return { valid: true };
  },
};
