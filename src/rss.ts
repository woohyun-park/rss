import { canonicalizeUrl, itemTimestamp } from "./normalize";
import { escapeXml } from "./text";
import type { FeedItem } from "./types";

interface RssOptions {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  items: FeedItem[];
}

export function createRssXml(options: RssOptions): string {
  const latestTimestamp = Math.max(0, ...options.items.map(itemTimestamp));
  const lastBuildDate = new Date(latestTimestamp || Date.now()).toUTCString();
  const itemXml = options.items.map(createItemXml).join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${escapeXml(options.title)}</title>`,
    `<description>${escapeXml(options.description)}</description>`,
    `<link>${escapeXml(options.siteUrl)}</link>`,
    `<atom:link href="${escapeXml(options.feedUrl)}" rel="self" type="application/rss+xml"/>`,
    `<lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    "<ttl>360</ttl>",
    itemXml,
    "</channel>",
    "</rss>",
    "",
  ].join("\n");
}

function createItemXml(item: FeedItem): string {
  const timestamp = itemTimestamp(item);
  const pubDate = new Date(timestamp || Date.now()).toUTCString();
  const description = item.summary
    ? `${item.summary}\n\nSource: ${item.sourceTitle}`
    : `Source: ${item.sourceTitle}`;

  return [
    "<item>",
    `<title>${escapeXml(item.title)}</title>`,
    `<link>${escapeXml(item.url)}</link>`,
    `<guid isPermaLink="true">${escapeXml(canonicalizeUrl(item.url))}</guid>`,
    `<pubDate>${pubDate}</pubDate>`,
    `<description>${escapeXml(description)}</description>`,
    `<source>${escapeXml(item.sourceTitle)}</source>`,
    "</item>",
  ].join("\n");
}

