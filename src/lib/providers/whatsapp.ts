// WhatsApp OTP provider abstraction.
// Set WHATSAPP_PROVIDER + WHATSAPP_API_URL/WHATSAPP_API_KEY in .env to plug in a real
// WhatsApp Business/Cloud API provider. In "mock" mode the OTP is logged to the server
// console so the flow can be tested without a live WhatsApp integration.

export async function sendWhatsAppOtp(mobile: string, otp: string): Promise<void> {
  const provider = process.env.WHATSAPP_PROVIDER ?? "mock";

  if (provider === "mock") {
    console.log(`[WhatsApp OTP MOCK] to=${mobile} otp=${otp}`);
    return;
  }

  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;
  if (!apiUrl || !apiKey) {
    throw new Error("WhatsApp provider is not configured (missing WHATSAPP_API_URL/WHATSAPP_API_KEY)");
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      to: mobile,
      type: "template",
      template: { name: "otp_verification", params: [otp] },
    }),
  });

  if (!res.ok) {
    throw new Error(`WhatsApp OTP send failed: ${res.status}`);
  }
}
