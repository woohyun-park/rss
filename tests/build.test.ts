import { describe, expect, it } from "vitest";

import { renderIndexHtml } from "../src/buildHtml";
import { PUBLIC_BASE_URL, sourceDefinitions } from "../src/sources";

describe("build configuration", () => {
  it("defines the GitHub Pages base URL and source feed files", () => {
    expect(PUBLIC_BASE_URL).toBe("https://woohyun-park.github.io/rss/");
    expect(sourceDefinitions.map((source) => [source.id, source.feedFile])).toEqual([
      ["evan-moon", "evan-moon.xml"],
      ["hoseung", "hoseung.xml"],
      ["hewon", "hewon.xml"],
      ["hiddenest", "hiddenest.xml"],
    ]);
  });

  it("renders an index page with aggregate and per-source feed links", () => {
    const html = renderIndexHtml({
      generatedAt: new Date("2026-06-01T00:00:00.000Z"),
      baseUrl: PUBLIC_BASE_URL,
      sources: sourceDefinitions,
    });

    expect(html).toContain('href="https://woohyun-park.github.io/rss/feed.xml"');
    expect(html).toContain('href="https://woohyun-park.github.io/rss/feeds/evan-moon.xml"');
    expect(html).toContain("2026-06-01T00:00:00.000Z");
  });
});
