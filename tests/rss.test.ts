import { XMLParser } from "fast-xml-parser";
import { describe, expect, it } from "vitest";

import { normalizeItems } from "../src/normalize";
import { createRssXml } from "../src/rss";
import type { FeedItem } from "../src/types";

describe("RSS generation", () => {
  const items: FeedItem[] = [
    {
      sourceId: "hewon",
      sourceTitle: "Hewon Jeong",
      title: "Older post",
      url: "https://hewon.dev/older/",
      publishedAt: "2023-01-01T00:00:00.000Z",
      summary: "Older summary",
    },
    {
      sourceId: "evan-moon",
      sourceTitle: "Evans Library",
      title: "Newest & escaped",
      url: "https://evan-moon.github.io/newest/",
      publishedAt: "2026-04-28T00:00:00.000Z",
      summary: "A summary with <angle brackets>.",
    },
    {
      sourceId: "evan-moon",
      sourceTitle: "Evans Library",
      title: "Duplicate URL",
      url: "https://evan-moon.github.io/newest",
      publishedAt: "2026-04-27T00:00:00.000Z",
      summary: "This duplicate should be removed.",
    },
  ];

  it("deduplicates by canonical URL and sorts newest first", () => {
    const normalized = normalizeItems(items, 10);

    expect(normalized.map((item) => item.title)).toEqual([
      "Newest & escaped",
      "Older post",
    ]);
  });

  it("creates parseable RSS 2.0 XML with escaped descriptions", () => {
    const xml = createRssXml({
      title: "Collected RSS",
      description: "RSS feeds for selected blogs",
      siteUrl: "https://woohyun-park.github.io/rss/",
      feedUrl: "https://woohyun-park.github.io/rss/feed.xml",
      items: normalizeItems(items, 10),
    });

    const parsed = new XMLParser({ ignoreAttributes: false }).parse(xml);

    expect(parsed.rss["@_version"] ?? parsed.rss.version).toBe("2.0");
    expect(parsed.rss.channel.title).toBe("Collected RSS");
    expect(parsed.rss.channel.item[0].title).toBe("Newest & escaped");
    expect(xml).toContain("&lt;angle brackets&gt;");
  });
});
