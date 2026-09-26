// WhatsApp OTP provider, selected by WHATSAPP_PROVIDER:
//   "meta" — real delivery through Meta's WhatsApp Cloud API using an approved
//            AUTHENTICATION template (with a "Copy code" button). Needs:
//              WHATSAPP_PHONE_NUMBER_ID   — from WhatsApp → API Setup
//              WHATSAPP_ACCESS_TOKEN      — a permanent System User token
//              WHATSAPP_OTP_TEMPLATE      — the approved template's name
//              WHATSAPP_TEMPLATE_LANGUAGE — the template's language code (default "en")
//              WHATSAPP_API_VERSION       — Graph API version (default "v23.0")
//   "mock" — local testing only: the OTP is logged to the server console (and shown on the
//            login screen by the send-otp route). Refused in production.

export class WhatsAppSendError extends Error {}

export function getWhatsAppProvider(): "meta" | "mock" {
  return process.env.WHATSAPP_PROVIDER === "meta" ? "meta" : "mock";
}

export async function sendWhatsAppOtp(mobile: string, otp: string): Promise<void> {
  const provider = getWhatsAppProvider();

  if (provider === "mock") {
    if (process.env.NODE_ENV === "production") {
      // A misconfigured production deploy must never "send" OTPs nobody receives.
      throw new WhatsAppSendError("WHATSAPP_PROVIDER must be set to 'meta' in production.");
    }
    console.log(`[WhatsApp OTP MOCK] to=${mobile} otp=${otp}`);
    return;
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const template = process.env.WHATSAPP_OTP_TEMPLATE;
  if (!phoneNumberId || !accessToken || !template) {
    throw new WhatsAppSendError(
      "WhatsApp is not configured: set WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN and WHATSAPP_OTP_TEMPLATE."
    );
  }
  const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en";
  const version = process.env.WHATSAPP_API_VERSION || "v23.0";

  // Authentication templates take the code twice: once for the message body and once for the
  // "Copy code" button (sent as a URL-button parameter, as Meta requires).
  const res = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: mobile.replace(/\D/g, ""), // "+919876543210" -> "919876543210"
      type: "template",
      template: {
        name: template,
        language: { code: language },
        components: [
          { type: "body", parameters: [{ type: "text", text: otp }] },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: otp }] },
        ],
      },
    }),
  });

  if (!res.ok) {
    // Log Meta's reason (never the OTP) so setup problems are easy to diagnose.
    const detail = await res.text().catch(() => "");
    console.error(`[WhatsApp OTP] Meta API error ${res.status}: ${detail.slice(0, 500)}`);
    throw new WhatsAppSendError(`WhatsApp OTP send failed: ${res.status}`);
  }
}
