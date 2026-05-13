import { createHash } from "node:crypto";
import type { PaymentProviderAdapter } from "./types";

/**
 * Click (clickpay.uz) adapter.
 *
 * Реальная интеграция: pay.click.uz/services/pay endpoint + Prepare/Complete
 * webhooks с подписью SHA1(...). Здесь — каркас для подключения позже:
 * генерим URL чекаута и валидируем хеш по официальной спецификации.
 *
 * ENV:
 *   CLICK_SERVICE_ID   — выдаётся в личном кабинете Click
 *   CLICK_MERCHANT_ID  — там же
 *   CLICK_SECRET_KEY   — секрет для подписи webhook
 */

const SERVICE_ID = process.env.CLICK_SERVICE_ID;
const MERCHANT_ID = process.env.CLICK_MERCHANT_ID;
const SECRET = process.env.CLICK_SECRET_KEY;

export const clickAdapter: PaymentProviderAdapter = {
  name: "click",

  async startCheckout({ orderId, amountUzs }) {
    if (!SERVICE_ID || !MERCHANT_ID) {
      return { ok: false, error: "click_not_configured" };
    }
    const base = "https://my.click.uz/services/pay";
    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?order=${orderId}`;
    const url = new URL(base);
    url.searchParams.set("service_id", SERVICE_ID);
    url.searchParams.set("merchant_id", MERCHANT_ID);
    url.searchParams.set("amount", String(amountUzs));
    url.searchParams.set("transaction_param", orderId);
    url.searchParams.set("return_url", returnUrl);
    return { ok: true, redirectUrl: url.toString(), orderId };
  },

  async verifyWebhook(body) {
    if (!SECRET) return { valid: false };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b = body as Record<string, any>;
    const expected = createHash("md5")
      .update(
        `${b.click_trans_id}${SERVICE_ID}${SECRET}${b.merchant_trans_id}${b.amount}${b.action}${b.sign_time}`,
      )
      .digest("hex");
    if (expected !== b.sign_string) return { valid: false };

    return {
      valid: true,
      orderId: String(b.merchant_trans_id),
      amountUzs: Number(b.amount),
      providerRef: String(b.click_trans_id),
    };
  },
};
