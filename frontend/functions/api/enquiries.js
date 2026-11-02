// POST /api/enquiries — Cloudflare Pages Function that replaces the FastAPI endpoint in backend/server.py.
// Bindings (wrangler.toml): DB = D1 database, ATTACHMENTS = R2 bucket. Secret: RESEND_API_KEY.
import { ALLOWED_EXT, EMAIL_RE, MAX_UPLOAD, THANKS, enquiryEmailHtml, newReference, sendEmail } from "../../cf/enquiry.js";

const json = (body, status = 200) => Response.json(body, { status });
const fail = (detail, status) => json({ detail }, status);

export async function onRequestPost({ request, env, waitUntil }) {
  // Only accept submissions from this site's own pages.
  const origin = request.headers.get("Origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return fail("Forbidden", 403);

  let form;
  try {
    form = await request.formData();
  } catch {
    return fail("Invalid form submission", 400);
  }
  const get = (k, n) => String(form.get(k) ?? "").trim().slice(0, n);
  const created_at = new Date().toISOString();

  // Honeypot: real visitors never see or fill the "website" field; bots do. Pretend success, store nothing.
  if (get("website", 200)) return json({ reference: newReference(), created_at, message: THANKS }, 201);

  const e = {
    reference: newReference(), created_at,
    full_name: get("full_name", 120), company: get("company", 160), email: get("email", 254), phone: get("phone", 40),
    city: get("city", 120), product: get("product", 200), quantity: get("quantity", 120),
    specification: get("specification", 300), message: get("message", 4000), source_page: get("source_page", 300),
    attachment_name: null, attachment_key: null,
  };
  if (!e.full_name || !e.company || !e.phone) return fail("Name, company and phone are required", 422);
  if (!EMAIL_RE.test(e.email)) return fail("Please enter a valid email address", 422);

  let attachment = null;
  const file = form.get("attachment");
  if (file && typeof file === "object" && file.name && file.size) {
    const ext = (file.name.match(/\.[^.]+$/)?.[0] || "").toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return fail("Unsupported attachment type", 422);
    if (file.size > MAX_UPLOAD) return fail("Attachment must be 5 MB or smaller", 413);
    e.attachment_name = file.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 120);
    attachment = { name: e.attachment_name, bytes: await file.arrayBuffer(), type: file.type || "application/octet-stream" };
    if (env.ATTACHMENTS) {
      e.attachment_key = `enquiries/${e.reference}/${crypto.randomUUID()}${ext}`;
      try {
        await env.ATTACHMENTS.put(e.attachment_key, attachment.bytes, { httpMetadata: { contentType: attachment.type } });
      } catch (err) {
        console.error("[enquiry] attachment upload failed", err);
        return fail("Attachment upload failed, please try again", 502);
      }
    }
  }

  // Without a database or an email key the enquiry would be lost, so say so instead of faking success.
  if (!env.DB && !env.RESEND_API_KEY) return fail("Enquiries are temporarily unavailable. Please contact us directly.", 503);

  if (env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO enquiries (reference, created_at, full_name, company, email, phone, city, product, quantity,
          specification, message, source_page, attachment_name, attachment_key, email_status)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, 'pending')`,
      ).bind(e.reference, e.created_at, e.full_name, e.company, e.email, e.phone, e.city, e.product, e.quantity,
        e.specification, e.message, e.source_page, e.attachment_name, e.attachment_key).run();
    } catch (err) {
      console.error("[enquiry] D1 insert failed", err);
      if (!env.RESEND_API_KEY) return fail("Could not save your enquiry, please try again", 500);
    }
  }

  // Email after responding, so the visitor isn't kept waiting on the mail provider.
  waitUntil(notify(env, e, attachment));
  return json({ reference: e.reference, created_at: e.created_at, message: THANKS }, 201);
}

async function notify(env, e, attachment) {
  let status;
  try {
    status = await sendEmail(env, {
      to: env.ENQUIRY_NOTIFY_EMAIL,
      subject: `New enquiry: ${e.product || "General"} — ${e.company}`,
      html: enquiryEmailHtml(e, env.EMAIL_FROM_NAME || "Twisty Wrap Enterprises"),
      replyTo: e.email,
      attachment,
    });
  } catch (err) {
    console.error("[enquiry] email failed", err);
    status = "failed";
  }
  if (env.DB) {
    await env.DB.prepare("UPDATE enquiries SET email_status = ?1 WHERE reference = ?2").bind(status, e.reference).run()
      .catch((err) => console.error("[enquiry] status update failed", err));
  }
}
