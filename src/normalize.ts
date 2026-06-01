import { timestampFor } from "./dates";
import { cleanText } from "./text";
import type { FeedItem } from "./types";

export function canonicalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    return parsed.toString();
  } catch {
    return cleanText(url);
  }
}

export function itemTimestamp(item: FeedItem): number {
  return Math.max(timestampFor(item.publishedAt), timestampFor(item.updatedAt));
}

export function normalizeItems(items: FeedItem[], limit: number): FeedItem[] {
  const byUrl = new Map<string, FeedItem>();

  for (const item of items) {
    const title = cleanText(item.title);
    const url = cleanText(item.url);

    if (!title || !url) {
      continue;
    }

    const normalized: FeedItem = {
      ...item,
      title,
      url,
      summary: cleanText(item.summary),
    };
    const key = canonicalizeUrl(url);
    const existing = byUrl.get(key);

    if (!existing || itemTimestamp(normalized) > itemTimestamp(existing)) {
      byUrl.set(key, normalized);
    }
  }

  return [...byUrl.values()]
    .sort((a, b) => itemTimestamp(b) - itemTimestamp(a) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

