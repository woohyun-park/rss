import * as cheerio from "cheerio";

import { toIsoDate } from "../dates";
import type { FetchText } from "../http";
import { cleanText } from "../text";
import type { FeedItem } from "../types";

const SITE_URL = "https://hewon.dev/";

export function parseHewonIndex(html: string): FeedItem[] {
  const $ = cheerio.load(html);
  const items: FeedItem[] = [];

  $("a").each((_, element) => {
    const article = $(element).find("article").first();
    if (!article.length) {
      return;
    }

    const href = cleanText($(element).attr("href"));
    const title = cleanText(article.find("h2").first().text());
    const publishedAt = toIsoDate(article.find("time[datetime]").first().attr("datetime"));

    if (!href || !title) {
      return;
    }

    items.push({
      sourceId: "hewon",
      sourceTitle: "Hewon Jeong",
      title,
      url: new URL(href, SITE_URL).toString(),
      publishedAt,
      summary: cleanText(article.find("p").first().text()),
    });
  });

  return items;
}

export async function collectHewon(fetchText: FetchText): Promise<FeedItem[]> {
  return parseHewonIndex(await fetchText(SITE_URL));
}

