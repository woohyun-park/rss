import { describe, expect, it } from "vitest";

import { parseEvanPageData } from "../src/collectors/evanMoon";
import {
  filterSitemapEntries,
  parseArticleHtml,
  parseSitemapUrlEntries,
} from "../src/collectors/sitemap";
import { parseHewonIndex } from "../src/collectors/hewon";
import { parseRssFeed } from "../src/collectors/rssFeed";

describe("source collectors", () => {
  it("parses Evan Moon Gatsby page-data without using the oversized RSS feed", () => {
    const fixture = {
      result: {
        data: {
          allMarkdownRemark: {
            edges: [
              {
                node: {
                  excerpt: "In a previous post, I treated personal asset management as state.",
                  fields: {
                    path: "/2026/04/28/tools-leave-their-maker/en/",
                  },
                  frontmatter: {
                    title: "Tools Live On After Leaving Their Maker",
                    subTitle: "Interface design questions from CLI and MCP tools",
                    date: "Apr 28, 2026",
                  },
                },
              },
            ],
            pageInfo: {
              pageCount: 8,
            },
          },
        },
      },
    };

    const result = parseEvanPageData(fixture);

    expect(result.pageCount).toBe(8);
    expect(result.items).toEqual([
      expect.objectContaining({
        sourceId: "evan-moon",
        sourceTitle: "Evans Library",
        title: "Tools Live On After Leaving Their Maker",
        url: "https://evan-moon.github.io/2026/04/28/tools-leave-their-maker/en/",
        publishedAt: "2026-04-28T00:00:00.000Z",
        summary: "Interface design questions from CLI and MCP tools",
      }),
    ]);
  });

  it("parses sitemap entries and filters index pages", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>https://hiddenest.dev</loc><lastmod>2026-05-03T14:52:20.281Z</lastmod></url>
        <url><loc>https://hiddenest.dev/en</loc><lastmod>2026-04-26T15:20:58.000Z</lastmod></url>
        <url><loc>https://hiddenest.dev/agent-first</loc><lastmod>2026-05-03T14:52:20.281Z</lastmod></url>
      </urlset>`;

    const entries = parseSitemapUrlEntries(xml);
    const filtered = filterSitemapEntries(entries, {
      siteUrl: "https://hiddenest.dev/",
      excludePaths: ["/", "/en"],
    });

    expect(filtered).toEqual([
      {
        loc: "https://hiddenest.dev/agent-first",
        lastmod: "2026-05-03T14:52:20.281Z",
      },
    ]);
  });

  it("extracts article metadata from a page HTML document", () => {
    const html = `<!doctype html>
      <html>
        <head>
          <title>Ignored fallback</title>
          <meta property="og:title" content="Library bundling for tree-shaking" />
          <meta name="description" content="How to bundle libraries without breaking tree-shaking." />
          <meta property="article:published_time" content="2025-08-26T15:00:00.000Z" />
        </head>
        <body><article><h1>Fallback h1</h1></article></body>
      </html>`;

    const item = parseArticleHtml(html, {
      sourceId: "hoseung",
      sourceTitle: "hoseung.me",
      url: "https://blog.hoseung.me/2025-08-27-library-bundling-for-treeshaking",
      fallbackDate: "2025-08-26T15:00:00.000Z",
    });

    expect(item).toEqual(
      expect.objectContaining({
        title: "Library bundling for tree-shaking",
        summary: "How to bundle libraries without breaking tree-shaking.",
        publishedAt: "2025-08-26T15:00:00.000Z",
      }),
    );
  });

  it("parses a full-content RSS feed into slim items without the encoded body", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">
        <channel>
          <title><![CDATA[jeong-min.com RSS Feed]]></title>
          <item>
            <title><![CDATA[Terraform, 테라 폼 미쳤다]]></title>
            <description><![CDATA[다들 테라 좋아하시나요?]]></description>
            <link>https://jeong-min.com/87-terraform/</link>
            <guid isPermaLink="false">https://jeong-min.com/87-terraform/</guid>
            <pubDate>Mon, 30 Mar 2026 00:00:00 GMT</pubDate>
            <content:encoded><![CDATA[<p>FULL HTML BODY THAT MUST BE IGNORED</p>]]></content:encoded>
          </item>
        </channel>
      </rss>`;

    const items = parseRssFeed(xml, {
      sourceId: "jeong-min",
      sourceTitle: "개발자 단민",
      feedUrl: "https://jeong-min.com/rss.xml",
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      sourceId: "jeong-min",
      sourceTitle: "개발자 단민",
      title: "Terraform, 테라 폼 미쳤다",
      url: "https://jeong-min.com/87-terraform/",
      publishedAt: "2026-03-30T00:00:00.000Z",
      summary: "다들 테라 좋아하시나요?",
    });
  });

  it("parses Hewon Jeong list cards from the homepage", () => {
    const html = `<main>
      <a href="/prompt-engineering/">
        <article>
          <h2>개발자를 위한 ChatGPT 프롬프트 엔지니어링</h2>
          <time datetime="2023-06-29">June 29, 2023</time>
          <p>ChatGPT Prompt Engineering for Developers 강의 노트</p>
        </article>
      </a>
      <a href="/cost-effective-tests/">
        <article>
          <h2>비용 효율적인 테스트 디자인하기</h2>
          <time datetime="2023-03-20">March 20, 2023</time>
          <p>테스트의 진정한 목표는 코드 작성 비용을 줄이는 것이다.</p>
        </article>
      </a>
    </main>`;

    const items = parseHewonIndex(html);

    expect(items).toHaveLength(2);
    expect(items[0]).toEqual(
      expect.objectContaining({
        sourceId: "hewon",
        title: "개발자를 위한 ChatGPT 프롬프트 엔지니어링",
        url: "https://hewon.dev/prompt-engineering/",
        publishedAt: "2023-06-29T00:00:00.000Z",
      }),
    );
  });
});

