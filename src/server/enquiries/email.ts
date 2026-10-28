import "server-only";
import { optionalEnv } from "../env";

export type EnquiryEmail = {
  name: string;
  email: string;
  company?: string;
  message: string;
  productName?: string;
};

// Sends a notification through Resend. Does nothing if Resend is not configured.
// The enquiry is already saved before this runs, so a failure here never loses it.
export async function sendEnquiryEmail(enquiry: EnquiryEmail): Promise<void> {
  const apiKey = optionalEnv("RESEND_API_KEY");
  const to = optionalEnv("ENQUIRY_TO_EMAIL");
  if (!apiKey || !to) return;

  const from = optionalEnv("ENQUIRY_FROM_EMAIL") ?? "onboarding@resend.dev";
  const safeName = enquiry.name.replace(/[\r\n]+/g, " ");
  const lines = [
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Company: ${enquiry.company || "-"}`,
    `Product: ${enquiry.productName || "-"}`,
    "",
    enquiry.message,
  ];

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: enquiry.email,
        subject: `New enquiry from ${safeName}`,
        text: lines.join("\n"),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error("Resend rejected the enquiry email", response.status, await response.text());
    }
  } catch (error) {
    console.error("Could not send the enquiry email", error);
  }
}
