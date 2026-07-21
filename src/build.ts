import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderIndexHtml } from "./buildHtml";
import { collectEvanMoon } from "./collectors/evanMoon";
import { collectHewon } from "./collectors/hewon";
import { collectRssFeed } from "./collectors/rssFeed";
import { collectSitemapSource } from "./collectors/sitemap";
import { fetchText, type FetchText } from "./http";
import { normalizeItems } from "./normalize";
import { createRssXml } from "./rss";
import { PUBLIC_BASE_URL, sourceDefinitions } from "./sources";
import type { FeedItem, SourceDefinition, SourceId } from "./types";

const SOURCE_ITEM_LIMIT = 80;
const AGGREGATE_ITEM_LIMIT = 200;

type Collector = (fetcher: FetchText) => Promise<FeedItem[]>;

const collectors: Record<SourceId, Collector> = {
  "evan-moon": collectEvanMoon,
  hoseung: (fetcher) =>
    collectSitemapSource(
      {
        sourceId: "hoseung",
        sourceTitle: "hoseung.me",
        siteUrl: "https://blog.hoseung.me/",
        sitemapUrl: "https://blog.hoseung.me/sitemap.xml",
        excludePaths: ["/"],
        maxPages: SOURCE_ITEM_LIMIT,
      },
      fetcher,
    ),
  hewon: collectHewon,
  "jeong-min": (fetcher) =>
    collectRssFeed(
      {
        sourceId: "jeong-min",
        sourceTitle: "개발자 단민",
        feedUrl: "https://jeong-min.com/rss.xml",
      },
      fetcher,
    ),
  hiddenest: (fetcher) =>
    collectSitemapSource(
      {
        sourceId: "hiddenest",
        sourceTitle: "hiddenest",
        siteUrl: "https://hiddenest.dev/",
        sitemapUrl: "https://hiddenest.dev/sitemap.xml",
        excludePaths: ["/", "/en"],
        maxPages: SOURCE_ITEM_LIMIT,
      },
      fetcher,
    ),
  kdy1: (fetcher) =>
    collectRssFeed(
      {
        sourceId: "kdy1",
        sourceTitle: "강동윤 (kdy1)",
        feedUrl: "https://kdy1.dev/rss.xml",
      },
      fetcher,
    ),
};

interface SourceBuildResult {
  source: SourceDefinition;
  items: FeedItem[];
}

export async function buildSite(
  outputDir = fileURLToPath(new URL("../dist/", import.meta.url)),
  fetcher = fetchText,
): Promise<void> {
  const generatedAt = new Date();
  const feedDir = join(outputDir, "feeds");
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(feedDir, { recursive: true });

  const results = await Promise.all(
    sourceDefinitions.map(async (source): Promise<SourceBuildResult> => {
      const items = normalizeItems(await collectors[source.id](fetcher), SOURCE_ITEM_LIMIT);

      if (items.length === 0) {
        throw new Error(`${source.id} returned 0 feed items`);
      }

      return { source, items };
    }),
  );

  for (const result of results) {
    await writeFile(
      join(feedDir, result.source.feedFile),
      createRssXml({
        title: `${result.source.title} RSS`,
        description: `Generated RSS feed for ${result.source.title}`,
        siteUrl: result.source.siteUrl,
        feedUrl: new URL(`feeds/${result.source.feedFile}`, PUBLIC_BASE_URL).toString(),
        items: result.items,
      }),
      "utf8",
    );
  }

  const aggregateItems = normalizeItems(
    results.flatMap((result) => result.items),
    AGGREGATE_ITEM_LIMIT,
  );
  await writeFile(
    join(outputDir, "feed.xml"),
    createRssXml({
      title: "Collected RSS",
      description: "RSS feeds for selected blogs",
      siteUrl: PUBLIC_BASE_URL,
      feedUrl: new URL("feed.xml", PUBLIC_BASE_URL).toString(),
      items: aggregateItems,
    }),
    "utf8",
  );

  await writeFile(
    join(outputDir, "index.html"),
    renderIndexHtml({
      generatedAt,
      baseUrl: PUBLIC_BASE_URL,
      sources: sourceDefinitions,
      counts: Object.fromEntries(results.map(({ source, items }) => [source.id, items.length])),
    }),
    "utf8",
  );

  for (const { source, items } of results) {
    console.log(`${source.id}: ${items.length} items`);
  }
  console.log(`aggregate: ${aggregateItems.length} items`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildSite().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

