/**
 * lib/email.ts — Optional email sending via Resend.
 *
 * The Resend client is NEVER created at module scope.
 * It is instantiated lazily inside each function, only when RESEND_API_KEY
 * is present in the environment. This means:
 *   - Build succeeds even without RESEND_API_KEY
 *   - Vercel deployment succeeds even without RESEND_API_KEY
 *   - All API routes continue working — emails are simply skipped with a log
 */

const FROM = process.env.EMAIL_FROM ?? "noreply@printora.in";
const STORE = process.env.NEXT_PUBLIC_STORE_NAME ?? "Printora";

/** Returns a Resend instance if the API key is configured, otherwise null. */
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  // Dynamic require keeps this off the module-init critical path
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Resend } = require("resend") as { Resend: new (key: string) => { emails: { send: (opts: unknown) => Promise<unknown> } } };
  return new Resend(apiKey);
}

/** Log a skip message when email is not configured. */
function logSkipped(fn: string) {
  console.log(`Email skipped: RESEND_API_KEY not configured. (${fn})`);
}

// ─── Public email functions ───────────────────────────────────────────────────

export async function sendOrderConfirmation(to: string, data: {
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; unitPrice: number; previewUrl?: string }>;
  totalAmount: number;
  shippingAddress: string;
  estimatedDelivery?: string;
}) {
  const resend = getResend();
  if (!resend) { logSkipped("sendOrderConfirmation"); return; }
  return resend.emails.send({
    from: `${STORE} <${FROM}>`,
    to,
    subject: `Your ${STORE} order #${data.orderNumber} is confirmed! 🎉`,
    html: buildOrderConfirmationHtml(data),
  });
}

export async function sendStatusUpdate(to: string, data: {
  orderNumber: string;
  customerName: string;
  status: string;
  message: string;
  trackingUrl: string;
}) {
  const resend = getResend();
  if (!resend) { logSkipped("sendStatusUpdate"); return; }
  return resend.emails.send({
    from: `${STORE} <${FROM}>`,
    to,
    subject: `Update on your ${STORE} order #${data.orderNumber}`,
    html: buildStatusUpdateHtml(data),
  });
}

export async function sendBatchInvite(to: string, data: {
  batchTitle: string;
  organizerName: string;
  productType: string;
  deadline: string;
  submissionUrl: string;
}) {
  const resend = getResend();
  if (!resend) { logSkipped("sendBatchInvite"); return; }
  return resend.emails.send({
    from: `${STORE} <${FROM}>`,
    to,
    subject: `Submit your photo for ${data.batchTitle}`,
    html: buildBatchInviteHtml(data),
  });
}

export async function sendBatchDesignReady(to: string, data: {
  batchTitle: string;
  organizerName: string;
  designPreviewUrl: string;
  reviewUrl: string;
}) {
  const resend = getResend();
  if (!resend) { logSkipped("sendBatchDesignReady"); return; }
  return resend.emails.send({
    from: `${STORE} <${FROM}>`,
    to,
    subject: `${data.batchTitle} — Your design is ready! ✅`,
    html: buildBatchDesignReadyHtml(data),
  });
}

export async function sendDispatchNotification(to: string, data: {
  orderNumber: string;
  customerName: string;
  courierName: string;
  trackingNumber: string;
  estimatedDelivery: string;
  address: string;
}) {
  const resend = getResend();
  if (!resend) { logSkipped("sendDispatchNotification"); return; }
  return resend.emails.send({
    from: `${STORE} <${FROM}>`,
    to,
    subject: `Your ${STORE} order is on its way! 🚚`,
    html: buildDispatchHtml(data),
  });
}

// ─── HTML builders ────────────────────────────────────────────────────────────

function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${STORE}</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:'DM Sans',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
      <!-- Header -->
      <tr><td style="background:#7C3AED;padding:24px 32px;text-align:center;">
        <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">${STORE}</span>
        <p style="color:#EDE9FE;margin:4px 0 0;font-size:13px;">Print anything. Perfectly.</p>
      </td></tr>
      <!-- Content -->
      <tr><td style="padding:32px;">${content}</td></tr>
      <!-- Footer -->
      <tr><td style="background:#F9FAFB;padding:20px 32px;text-align:center;border-top:1px solid #E5E7EB;">
        <p style="color:#6B7280;font-size:12px;margin:0;">
          © ${new Date().getFullYear()} ${STORE} · Vijayawada, India<br/>
          <a href="mailto:hello@printora.in" style="color:#7C3AED;">hello@printora.in</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function buildOrderConfirmationHtml(data: Parameters<typeof sendOrderConfirmation>[1]) {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #F3F4F6;">
        <strong>${item.name}</strong> × ${item.quantity}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #F3F4F6;text-align:right;">
        ₹${(item.unitPrice * item.quantity).toLocaleString("en-IN")}
      </td>
    </tr>`).join("");

  return emailWrapper(`
    <h2 style="color:#111827;margin:0 0 8px;font-size:22px;">Order Confirmed! 🎉</h2>
    <p style="color:#6B7280;margin:0 0 24px;">Hi ${data.customerName}, thank you for your order.</p>

    <div style="background:#EDE9FE;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;color:#7C3AED;font-weight:600;font-size:14px;">Order Number</p>
      <p style="margin:4px 0 0;color:#111827;font-size:20px;font-weight:700;font-family:monospace;">#${data.orderNumber}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${itemsHtml}
      <tr>
        <td style="padding:12px 0 0;font-weight:700;color:#111827;">Total</td>
        <td style="padding:12px 0 0;font-weight:700;color:#111827;text-align:right;">₹${data.totalAmount.toLocaleString("en-IN")}</td>
      </tr>
    </table>

    <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;color:#6B7280;font-size:13px;">Delivering to</p>
      <p style="margin:0;color:#111827;font-size:14px;">${data.shippingAddress}</p>
      ${data.estimatedDelivery ? `<p style="margin:8px 0 0;color:#6B7280;font-size:13px;">Estimated: ${data.estimatedDelivery}</p>` : ""}
    </div>

    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://printora.in"}/track" style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:100px;font-weight:600;font-size:15px;">Track Your Order →</a>
    </div>
  `);
}

function buildStatusUpdateHtml(data: Parameters<typeof sendStatusUpdate>[1]) {
  return emailWrapper(`
    <h2 style="color:#111827;margin:0 0 8px;font-size:22px;">Order Update</h2>
    <p style="color:#6B7280;margin:0 0 24px;">Hi ${data.customerName}, here's an update on your order.</p>

    <div style="background:#EDE9FE;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;color:#7C3AED;font-weight:600;font-size:14px;">Order #${data.orderNumber}</p>
      <p style="margin:8px 0 0;color:#111827;font-size:18px;font-weight:700;">${data.status.replace(/_/g, " ")}</p>
    </div>

    <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;color:#111827;">${data.message}</p>
    </div>

    <div style="text-align:center;">
      <a href="${data.trackingUrl}" style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:100px;font-weight:600;font-size:15px;">View Full Tracking →</a>
    </div>
  `);
}

function buildBatchInviteHtml(data: Parameters<typeof sendBatchInvite>[1]) {
  return emailWrapper(`
    <h2 style="color:#111827;margin:0 0 8px;font-size:22px;">Submit Your Photo 📸</h2>
    <p style="color:#6B7280;margin:0 0 24px;">${data.organizerName} has invited you to submit your photo for <strong>${data.batchTitle}</strong>.</p>

    <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;"><strong>Product:</strong> ${data.productType}</p>
      <p style="margin:8px 0 0;"><strong>Deadline:</strong> ${data.deadline}</p>
    </div>

    <div style="background:#FEF3C7;border-radius:8px;padding:12px;margin-bottom:24px;">
      <p style="margin:0;color:#92400E;font-size:13px;">📋 <strong>Photo Guidelines:</strong> Use a clear, front-facing photo with good lighting. Minimum 500×500px, JPG or PNG.</p>
    </div>

    <div style="text-align:center;">
      <a href="${data.submissionUrl}" style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:100px;font-weight:600;font-size:16px;">Submit Your Photo →</a>
    </div>
  `);
}

function buildBatchDesignReadyHtml(data: Parameters<typeof sendBatchDesignReady>[1]) {
  return emailWrapper(`
    <h2 style="color:#111827;margin:0 0 8px;font-size:22px;">Your Design Is Ready! ✅</h2>
    <p style="color:#6B7280;margin:0 0 24px;">Hi ${data.organizerName}, your batch design for <strong>${data.batchTitle}</strong> is ready for review.</p>

    ${data.designPreviewUrl ? `<div style="text-align:center;margin-bottom:24px;"><img src="${data.designPreviewUrl}" alt="Design Preview" style="max-width:100%;border-radius:8px;border:1px solid #E5E7EB;" /></div>` : ""}

    <div style="text-align:center;">
      <a href="${data.reviewUrl}" style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:100px;font-weight:600;font-size:16px;">Review &amp; Order →</a>
    </div>
  `);
}

function buildDispatchHtml(data: Parameters<typeof sendDispatchNotification>[1]) {
  return emailWrapper(`
    <h2 style="color:#111827;margin:0 0 8px;font-size:22px;">Your Order Is On Its Way! 🚚</h2>
    <p style="color:#6B7280;margin:0 0 24px;">Hi ${data.customerName}, order #${data.orderNumber} has been dispatched.</p>

    <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;"><strong>Courier:</strong> ${data.courierName}</p>
      <p style="margin:8px 0;"><strong>Tracking Number:</strong> <span style="font-family:monospace;color:#7C3AED;">${data.trackingNumber}</span></p>
      <p style="margin:0;"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
    </div>

    <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 4px;color:#6B7280;font-size:13px;">Delivering to</p>
      <p style="margin:0;">${data.address}</p>
    </div>

    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://printora.in"}/track" style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:100px;font-weight:600;font-size:15px;">Track Shipment →</a>
    </div>
  `);
}
