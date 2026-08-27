/** Print verify links in the API terminal during local dev (skip prod unless forced). */
export function logEmailVerificationLink(input: {
  email: string;
  token: string;
  appDeepLink: string;
  apiBaseUrl?: string;
}): void {
  const logInProd = process.env.LOG_AUTH_LINKS === "true";
  if (process.env.NODE_ENV === "production" && !logInProd) return;

  const apiUrl = input.apiBaseUrl
    ? `${input.apiBaseUrl.replace(/\/$/, "")}/api/auth/verify-email?token=${encodeURIComponent(input.token)}`
    : null;

  console.log("\n========== EMAIL VERIFICATION LINK ==========");
  console.log(`Email:  ${input.email}`);
  console.log(`Token:  ${input.token}`);
  console.log(`App:    ${input.appDeepLink}`);
  if (apiUrl) console.log(`API:    ${apiUrl}`);
  console.log("=============================================\n");
}

export async function sendAuthEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const sendFailed = new Error("Could not send email. Try again later.");

  if (!resendKey || !from) {
    console.error(
      "[auth-email] RESEND_API_KEY or RESEND_FROM_EMAIL is not set",
    );
    throw sendFailed;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    console.error("[auth-email] Resend failed:", response.status);
    throw sendFailed;
  }
}
