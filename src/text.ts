export function cleanText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function stripSiteSuffix(title: string, sourceTitle: string): string {
  const escaped = sourceTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return cleanText(title.replace(new RegExp(`\\s*(?:\\||-|–|—)\\s*${escaped}$`, "i"), ""));
}

