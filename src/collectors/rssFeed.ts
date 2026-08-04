import { XMLParser } from "fast-xml-parser";

import { toIsoDate } from "../dates";
import type { FetchText } from "../http";
import { cleanText } from "../text";
import type { FeedItem, SourceId } from "../types";

export interface RssFeedCollectOptions {
  sourceId: SourceId;
  sourceTitle: string;
  feedUrl: string;
}

export type AtomFeedCollectOptions = RssFeedCollectOptions;

interface RawRssItem {
  title?: unknown;
  link?: unknown;
  pubDate?: unknown;
  description?: unknown;
}

interface RawAtomLink {
  "@_href"?: unknown;
  "@_rel"?: unknown;
}

interface RawAtomEntry {
  title?: unknown;
  link?: RawAtomLink | RawAtomLink[];
  id?: unknown;
  published?: unknown;
  updated?: unknown;
  summary?: unknown;
}

export function parseRssFeed(xml: string, options: RssFeedCollectOptions): FeedItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
  });
  const parsed = parser.parse(xml) as {
    rss?: { channel?: { item?: RawRssItem[] | RawRssItem } };
  };
  const rawItems = parsed.rss?.channel?.item;
  const items = rawItems ? (Array.isArray(rawItems) ? rawItems : [rawItems]) : [];

  return items.flatMap((raw): FeedItem[] => {
    const title = asText(raw.title);
    const url = asText(raw.link);

    if (!title || !url) {
      return [];
    }

    const summary = stripTags(asText(raw.description));

    return [
      {
        sourceId: options.sourceId,
        sourceTitle: options.sourceTitle,
        title,
        url,
        publishedAt: toIsoDate(asText(raw.pubDate) || undefined),
        summary: summary || undefined,
      },
    ];
  });
}

export async function collectRssFeed(
  options: RssFeedCollectOptions,
  fetchText: FetchText,
): Promise<FeedItem[]> {
  return parseRssFeed(await fetchText(options.feedUrl), options);
}

export function parseAtomFeed(xml: string, options: AtomFeedCollectOptions): FeedItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
  });
  const parsed = parser.parse(xml) as {
    feed?: { entry?: RawAtomEntry[] | RawAtomEntry };
  };
  const rawEntries = parsed.feed?.entry;
  const entries = rawEntries ? (Array.isArray(rawEntries) ? rawEntries : [rawEntries]) : [];

  return entries.flatMap((raw): FeedItem[] => {
    const title = asText(raw.title);
    const url = atomEntryUrl(raw);

    if (!title || !url) {
      return [];
    }

    const summary = stripTags(asText(raw.summary));

    return [
      {
        sourceId: options.sourceId,
        sourceTitle: options.sourceTitle,
        title,
        url,
        publishedAt: toIsoDate(asText(raw.published) || asText(raw.updated) || undefined),
        updatedAt: toIsoDate(asText(raw.updated) || undefined),
        summary: summary || undefined,
      },
    ];
  });
}

export async function collectAtomFeed(
  options: AtomFeedCollectOptions,
  fetchText: FetchText,
): Promise<FeedItem[]> {
  return parseAtomFeed(await fetchText(options.feedUrl), options);
}

function atomEntryUrl(entry: RawAtomEntry): string {
  const links = entry.link ? (Array.isArray(entry.link) ? entry.link : [entry.link]) : [];
  const alternate = links.find((link) => {
    const rel = asText(link["@_rel"]);
    return !rel || rel === "alternate";
  });

  return asText(alternate?.["@_href"]) || asText(links[0]?.["@_href"]) || asText(entry.id);
}

function asText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    const text = (value as { "#text"?: unknown })["#text"];
    return text === undefined ? "" : cleanText(String(text));
  }

  return cleanText(String(value));
}

function stripTags(value: string): string {
  return cleanText(value.replace(/<[^>]*>/g, " "));
}
