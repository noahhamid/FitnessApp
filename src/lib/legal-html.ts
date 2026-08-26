import {
  PRIVACY_POLICY,
  TERMS_OF_SERVICE,
  type LegalDocument,
} from "@/src/features/legal/legal-content";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function richHtml(text: string): string {
  return escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

export function renderLegalHtml(document: LegalDocument): string {
  const intro = document.intro.map((p) => `<p>${richHtml(p)}</p>`).join("");
  const sections = document.sections
    .map((section) => {
      const blocks = section.blocks
        .map((block) => {
          if (block.type === "ul") {
            const items = block.items
              .map((item) => `<li>${richHtml(item)}</li>`)
              .join("");
            return `<ul>${items}</ul>`;
          }
          return `<p>${richHtml(block.text)}</p>`;
        })
        .join("");
      return `<section><h2>${escapeHtml(section.heading)}</h2>${blocks}</section>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(document.title)} — PotentialPeak</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 40rem; margin: 2rem auto; padding: 0 1.25rem; color: #111; }
    h1 { font-size: 1.75rem; }
    h2 { font-size: 1.15rem; margin-top: 1.75rem; }
    .updated { color: #555; }
    ul { padding-left: 1.25rem; }
  </style>
</head>
<body>
  <h1>${escapeHtml(document.title)}</h1>
  <p class="updated">Last updated: ${escapeHtml(document.updated)}</p>
  ${intro}
  ${sections}
</body>
</html>`;
}

export const PRIVACY_HTML = renderLegalHtml(PRIVACY_POLICY);
export const TERMS_HTML = renderLegalHtml(TERMS_OF_SERVICE);
