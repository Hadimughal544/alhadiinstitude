import "server-only";
import { Resend } from "resend";

/**
 * Thin wrapper around Resend. Email failures are logged and swallowed —
 * a broken email provider should never fail a form submission or DB write.
 */
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

async function safeSend(params: { to: string; subject: string; html: string }) {
  const client = getResendClient();
  if (!client) {
    console.warn("[email] RESEND_API_KEY not set — skipping email:", params.subject);
    return;
  }
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  try {
    await client.emails.send({ from, to: params.to, subject: params.subject, html: params.html });
  } catch (error) {
    console.error("[email] Failed to send:", params.subject, error);
  }
}

export async function sendTeacherApplicationConfirmation({
  to,
  name,
  serviceName,
}: {
  to: string;
  name: string;
  serviceName: string;
}) {
  await safeSend({
    to,
    subject: "We received your application — Al-Hadi Institute",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#0f766e;">Thank you, ${escapeHtml(name)}!</h2>
        <p>We've received your application to join Al-Hadi Institute as a teacher/tutor for
        <strong>${escapeHtml(serviceName)}</strong>.</p>
        <p>Our team will review your application and get back to you shortly.</p>
        <p style="margin-top:24px;color:#666;font-size:13px;">— Al-Hadi Institute</p>
      </div>
    `,
  });
}

export async function sendTeacherApplicationAdminAlert({
  name,
  email,
  phone,
  serviceSlug,
  subject,
  experience,
  message,
}: {
  name: string;
  email: string;
  phone: string;
  serviceSlug: string;
  subject?: string | null;
  experience?: string | null;
  message?: string | null;
}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.warn("[email] ADMIN_NOTIFICATION_EMAIL not set — skipping admin alert.");
    return;
  }
  await safeSend({
    to: adminEmail,
    subject: `New teacher application: ${name} (${serviceSlug})`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2>New Teacher/Tutor Application</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Service:</strong> ${escapeHtml(serviceSlug)}</p>
        ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ""}
        ${experience ? `<p><strong>Experience:</strong> ${escapeHtml(experience)}</p>` : ""}
        ${message ? `<p><strong>Message:</strong><br/>${escapeHtml(message)}</p>` : ""}
        <p style="margin-top:24px;"><a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/teacher-applications">View in admin panel</a></p>
      </div>
    `,
  });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
