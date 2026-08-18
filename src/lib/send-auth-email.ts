/**
 * Transactional auth mail via Resend. Throws if mail is not configured
 * or the provider rejects the send — callers must not pretend it worked.
 *
 * PRE-LAUNCH BLOCKER — Resend is in sandbox mode for this project:
 *   - Use FROM `onboarding@resend.dev` (not beth.t@example.com).
 *   - Sandbox only delivers to the Resend account owner's email
 *     (currently fitsumfg03@gmail.com). Real user addresses will NOT
 *     receive verification / password-reset / delete-confirmation mail
 *     until a domain is verified at https://resend.com/domains and
 *     RESEND_FROM_EMAIL is updated to that domain before public launch.
 */
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
