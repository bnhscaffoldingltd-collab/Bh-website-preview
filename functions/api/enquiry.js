/**
 * POST /api/enquiry — Cloudflare Pages Function.
 * Sends the quote form to ops@bhscaffolding.co.uk through Resend (https://resend.com).
 *
 * Required settings (Cloudflare Pages > Settings > Variables and Secrets):
 *   RESEND_API_KEY   secret, from a Resend account with bhscaffolding.co.uk verified as a sending domain
 *   ENQUIRY_FROM     e.g. "B&H Website <website@bhscaffolding.co.uk>"
 *   ENQUIRY_TO       ops@bhscaffolding.co.uk
 * Then set data-live="true" on the form in index.html.
 * Nothing secret is ever sent to the browser.
 */
const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const OK_TYPES = /^(image\/(jpeg|png|webp|heic|heif)|application\/pdf)$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function toBase64(buf) {
  let bin = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY || !env.ENQUIRY_TO || !env.ENQUIRY_FROM) {
    return json({ ok: false, error: "Online enquiries are not set up yet. Please email ops@bhscaffolding.co.uk." }, 503);
  }
  let form;
  try { form = await request.formData(); } catch { return json({ ok: false, error: "The form could not be read." }, 400); }

  if ((form.get("website") || "").trim()) return json({ ok: true }); // spam trap: pretend success, send nothing

  const f = (k) => String(form.get(k) || "").trim().slice(0, 4000);
  const data = {
    name: f("name"), company: f("company"), phone: f("phone"), email: f("email"),
    site: f("site"), start: f("start"), duration: f("duration"), scope: f("scope"),
  };
  for (const k of ["name", "phone", "email", "site", "scope"]) {
    if (!data[k]) return json({ ok: false, error: "Please complete all required fields." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return json({ ok: false, error: "Please enter a valid email address." }, 400);

  const files = form.getAll("files").filter((x) => x && typeof x === "object" && x.size > 0);
  if (files.length > MAX_FILES) return json({ ok: false, error: "Please attach up to 5 files." }, 400);
  let total = 0;
  const attachments = [];
  for (const file of files) {
    total += file.size;
    if (total > MAX_BYTES) return json({ ok: false, error: "Attachments must be 10 MB or less in total." }, 400);
    if (!OK_TYPES.test(file.type)) return json({ ok: false, error: "Attachments must be photos or PDFs." }, 400);
    attachments.push({ filename: file.name.replace(/[^\w.\- ]/g, "_").slice(0, 100), content: toBase64(await file.arrayBuffer()) });
  }

  const rows = [
    ["Name", data.name], ["Company", data.company || "-"], ["Phone", data.phone], ["Email", data.email],
    ["Site", data.site], ["Required from", data.start || "-"], ["Duration", data.duration || "-"],
  ];
  const html =
    `<h2 style="font-family:Arial,sans-serif">New scaffolding enquiry</h2>` +
    `<table style="font-family:Arial,sans-serif;border-collapse:collapse">` +
    rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td style="padding:4px 0"><strong>${esc(v)}</strong></td></tr>`).join("") +
    `</table><h3 style="font-family:Arial,sans-serif">Scope</h3><p style="font-family:Arial,sans-serif;white-space:pre-wrap">${esc(data.scope)}</p>` +
    (attachments.length ? `<p style="font-family:Arial,sans-serif;color:#666">${attachments.length} attachment(s) included.</p>` : "");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM,
      to: [env.ENQUIRY_TO],
      reply_to: data.email,
      subject: `Website enquiry: ${data.site}`.slice(0, 150),
      html,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nScope:\n${data.scope}`,
      attachments,
    }),
  });
  if (!res.ok) return json({ ok: false, error: "Your enquiry could not be sent. Please email ops@bhscaffolding.co.uk." }, 502);
  return json({ ok: true });
}

export const onRequestGet = () => json({ ok: false, error: "Method not allowed" }, 405);
