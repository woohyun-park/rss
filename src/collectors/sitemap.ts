import * as cheerio from "cheerio";
import { XMLParser } from "fast-xml-parser";

import { toIsoDate } from "../dates";
import type { FetchText } from "../http";
import { cleanText, stripSiteSuffix } from "../text";
import type { FeedItem, SourceId } from "../types";

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

export interface SitemapFilterOptions {
  siteUrl: string;
  excludePaths: string[];
}

interface ArticleParseOptions {
  sourceId: SourceId;
  sourceTitle: string;
  url: string;
  fallbackDate?: string;
}

interface SitemapCollectOptions extends SitemapFilterOptions {
  sourceId: SourceId;
  sourceTitle: string;
  sitemapUrl: string;
  maxPages?: number;
}

export function parseSitemapUrlEntries(xml: string): SitemapEntry[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true,
  });
  const parsed = parser.parse(xml) as {
    urlset?: {
      url?: Array<{ loc?: string; lastmod?: string }> | { loc?: string; lastmod?: string };
    };
  };
  const urls = parsed.urlset?.url
    ? Array.isArray(parsed.urlset.url)
      ? parsed.urlset.url
      : [parsed.urlset.url]
    : [];

  return urls.flatMap((url): SitemapEntry[] => {
    const loc = cleanText(url.loc);
    if (!loc) {
      return [];
    }

    return [
      {
        loc,
        lastmod: cleanText(url.lastmod) || undefined,
      },
    ];
  });
}

export function filterSitemapEntries(
  entries: SitemapEntry[],
  options: SitemapFilterOptions,
): SitemapEntry[] {
  const site = new URL(options.siteUrl);
  const excludePaths = new Set(options.excludePaths.map(normalizePath));

  return entries
    .filter((entry) => {
      const url = new URL(entry.loc);
      return url.origin === site.origin && !excludePaths.has(normalizePath(url.pathname));
    })
    .sort((a, b) => {
      const bTime = Date.parse(b.lastmod ?? "");
      const aTime = Date.parse(a.lastmod ?? "");
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    });
}

export function parseArticleHtml(html: string, options: ArticleParseOptions): FeedItem {
  const $ = cheerio.load(html);
  const rawTitle =
    meta($, 'meta[property="og:title"]') ||
    meta($, 'meta[name="twitter:title"]') ||
    $("h1").first().text() ||
    $("title").first().text();
  const summary =
    meta($, 'meta[name="description"]') ||
    meta($, 'meta[property="og:description"]') ||
    meta($, 'meta[name="twitter:description"]') ||
    $("article p").first().text();
  const publishedAt =
    toIsoDate(meta($, 'meta[property="article:published_time"]')) ||
    toIsoDate($("time[datetime]").first().attr("datetime")) ||
    toIsoDate(options.fallbackDate);
  const updatedAt =
    toIsoDate(meta($, 'meta[property="article:modified_time"]')) || toIsoDate(options.fallbackDate);

  return {
    sourceId: options.sourceId,
    sourceTitle: options.sourceTitle,
    title: stripSiteSuffix(rawTitle, options.sourceTitle),
    url: options.url,
    publishedAt,
    updatedAt,
    summary: cleanText(summary),
  };
}

export async function collectSitemapSource(
  options: SitemapCollectOptions,
  fetchText: FetchText,
): Promise<FeedItem[]> {
  const xml = await fetchText(options.sitemapUrl);
  const entries = filterSitemapEntries(parseSitemapUrlEntries(xml), options).slice(
    0,
    options.maxPages ?? 80,
  );
  const items = await mapLimit(entries, 6, async (entry) => {
    try {
      const html = await fetchText(entry.loc);
      return parseArticleHtml(html, {
        sourceId: options.sourceId,
        sourceTitle: options.sourceTitle,
        url: entry.loc,
        fallbackDate: entry.lastmod,
      });
    } catch (error) {
      console.warn(`Skipping ${entry.loc}: ${error instanceof Error ? error.message : error}`);
      return undefined;
    }
  });

  return items.filter((item): item is FeedItem => Boolean(item));
}

function normalizePath(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

function meta($: cheerio.CheerioAPI, selector: string): string {
  return cleanText($(selector).first().attr("content"));
}

async function mapLimit<T, R>(
  values: T[],
  concurrency: number,
  worker: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;
  const workerCount = Math.min(concurrency, values.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < values.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await worker(values[index]);
      }
    }),
  );

  return results;
}

