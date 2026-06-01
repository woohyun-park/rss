import { escapeXml } from "./text";
import type { SourceDefinition, SourceId } from "./types";

interface RenderIndexOptions {
  generatedAt: Date;
  baseUrl: string;
  sources: SourceDefinition[];
  counts?: Partial<Record<SourceId, number>>;
}

export function renderIndexHtml(options: RenderIndexOptions): string {
  const aggregateUrl = new URL("feed.xml", options.baseUrl).toString();
  const sourceLinks = options.sources
    .map((source) => {
      const url = new URL(`feeds/${source.feedFile}`, options.baseUrl).toString();
      const count = options.counts?.[source.id];
      const countText = typeof count === "number" ? ` <span>${count} items</span>` : "";
      return `<li><a href="${escapeXml(url)}">${escapeXml(source.title)}</a>${countText}</li>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Collected RSS Feeds</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 720px; margin: 48px auto; padding: 0 20px; line-height: 1.55; }
      code, time { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
      li { margin: 8px 0; }
      span { color: #666; font-size: 0.9em; }
    </style>
  </head>
  <body>
    <h1>Collected RSS Feeds</h1>
    <p><a href="${escapeXml(aggregateUrl)}">All sources</a></p>
    <ul>
${sourceLinks}
    </ul>
    <p>Last built: <time datetime="${options.generatedAt.toISOString()}">${options.generatedAt.toISOString()}</time></p>
  </body>
</html>
`;
}

