/** Always print verify links in the local API terminal. */
export function logEmailVerificationLink(input: {
  email: string;
  token: string;
  appDeepLink: string;
  apiBaseUrl?: string;
}): void {
  const apiUrl = input.apiBaseUrl
    ? `${input.apiBaseUrl.replace(/\/$/, "")}/api/auth/verify-email?token=${encodeURIComponent(input.token)}`
    : null;

  // Visible even if stdout is buffered oddly on Windows.
  console.log("");
  console.log("========== EMAIL VERIFICATION LINK ==========");
  console.log(`Email:  ${input.email}`);
  console.log(`Token:  ${input.token}`);
  console.log(`App:    ${input.appDeepLink}`);
  if (apiUrl) console.log(`API:    ${apiUrl}`);
  console.log("Open the App: URL on your phone to verify.");
  console.log("=============================================");
  console.log("");
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
