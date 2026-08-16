import sanitizeHtml from "sanitize-html";

/**
 * Server-safe HTML sanitizer (no jsdom). Used on Vercel/Node serverless
 * where isomorphic-dompurify fails with ERR_REQUIRE_ESM.
 */
export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h2",
      "h3",
      "h4",
      "img",
      "hr",
      "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title", "class"],
      img: ["src", "alt", "title", "class"],
      "*": ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}

export function slugifyBlog(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
