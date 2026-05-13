import QRCode from "qrcode";

export type QrPayload = {
  eventId: string;
  tableNumber?: number;
};

export function buildGuestUrl(baseUrl: string, payload: QrPayload) {
  const url = new URL(`/e/${payload.eventId}`, baseUrl);
  if (payload.tableNumber !== undefined) {
    url.searchParams.set("t", String(payload.tableNumber));
  }
  return url.toString();
}

export async function toDataURL(content: string) {
  return QRCode.toDataURL(content, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 512,
    color: { dark: "#1a1a1a", light: "#ffffff" },
  });
}

export async function toSVGString(content: string) {
  return QRCode.toString(content, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 1,
    width: 512,
  });
}
