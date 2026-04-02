import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM_ADDRESS =
  process.env.EMAIL_FROM || "Predict the Match <onboarding@resend.dev>";

export async function sendPromoCodeEmail(
  email: string,
  name: string,
  promoCode: string,
  matchDetails: string
) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping promo email to:", email);
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "You predicted correctly! Here's your reward",
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 560px; margin: 0 auto; background: #EDF1F7; color: #1A1D23; padding: 40px 32px;">
          <div style="border-bottom: 2px solid #2B5AAA; padding-bottom: 20px; margin-bottom: 28px;">
            <h1 style="color: #16A34A; font-size: 22px; margin: 0 0 4px 0; font-weight: 700;">Correct Prediction</h1>
            <p style="color: #5F6068; margin: 0; font-size: 14px;">Nice call, ${name}.</p>
          </div>
          <div style="background: #FFFFFF; padding: 20px; border-left: 3px solid #2B5AAA; margin-bottom: 24px; border: 1px solid #E5E1D8; border-left: 3px solid #2B5AAA;">
            <p style="color: #7A7B86; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 6px 0;">Match</p>
            <p style="color: #1A1D23; font-size: 16px; font-weight: 600; margin: 0;">${matchDetails}</p>
          </div>
          <div style="background: #FFFFFF; padding: 28px; text-align: center; border: 1px dashed #2B5AAA;">
            <p style="color: #7A7B86; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 10px 0;">Your Promo Code</p>
            <p style="color: #2B5AAA; font-size: 26px; font-weight: 800; letter-spacing: 4px; margin: 0; font-family: monospace;">${promoCode}</p>
          </div>
          <p style="color: #9A9BA3; font-size: 11px; margin-top: 28px; text-align: center;">Predict the Match &mdash; World Cup 2026</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send promo email:", error);
    return false;
  }
}

export async function sendAdminAlert(message: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("ADMIN_EMAIL not set, skipping alert:", message);
    return;
  }

  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping admin alert");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: adminEmail,
      subject: "[Predict the Match] Manual review needed",
      html: `
        <div style="font-family: sans-serif; padding: 24px; background: #EDF1F7; color: #1A1D23;">
          <h2 style="color: #D97706;">Action Required</h2>
          <p>${message}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send admin alert:", error);
  }
}
