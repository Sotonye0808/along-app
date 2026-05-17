interface EmailLayoutOptions {
    brandName: string;
    title: string;
    preheader?: string;
    bodyHtml: string;
    ctaLabel?: string;
    ctaUrl?: string;
    footerNote?: string;
}

export function renderEmailLayout(options: EmailLayoutOptions): string {
    const preheader = options.preheader
        ? `<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${options.preheader}</span>`
        : "";

    const cta =
        options.ctaLabel && options.ctaUrl
            ? `<a href="${options.ctaUrl}" style="display:inline-block;background:#00623B;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:600;">${options.ctaLabel}</a>`
            : "";

    const footerNote = options.footerNote
        ? `<p style="margin:16px 0 0;font-size:12px;color:#6b7280;">${options.footerNote}</p>`
        : "";

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${options.brandName}</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f7f7;font-family:Arial,Helvetica,sans-serif;color:#232323;">
    ${preheader}
    <div style="padding:24px;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:24px;">
        <p style="margin:0 0 12px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">${options.brandName}</p>
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">${options.title}</h1>
        <div style="font-size:14px;line-height:1.6;">${options.bodyHtml}</div>
        ${cta ? `<div style="margin-top:20px;">${cta}</div>` : ""}
        ${footerNote}
      </div>
      <p style="max-width:600px;margin:12px auto 0;font-size:12px;color:#9ca3af;text-align:center;">${options.brandName} · Navigate Together</p>
    </div>
  </body>
</html>`;
}
