import { toIsoDate } from "../dates";
import type { FetchText } from "../http";
import { cleanText } from "../text";
import type { FeedItem } from "../types";

const SITE_URL = "https://evan-moon.github.io/";
const FIRST_PAGE_DATA_URL = "https://evan-moon.github.io/page-data/posts/page-data.json";

interface EvanParseResult {
  items: FeedItem[];
  pageCount: number;
}

export function parseEvanPageData(raw: unknown): EvanParseResult {
  const pageData = raw as {
    result?: {
      data?: {
        allMarkdownRemark?: {
          edges?: Array<{
            node?: {
              excerpt?: string;
              fields?: {
                path?: string;
                slug?: string;
              };
              frontmatter?: {
                title?: string;
                subTitle?: string;
                date?: string;
              };
            };
          }>;
          pageInfo?: {
            pageCount?: number;
          };
        };
      };
    };
  };

  const markdown = pageData.result?.data?.allMarkdownRemark;
  const edges = Array.isArray(markdown?.edges) ? markdown.edges : [];
  const items = edges.flatMap((edge): FeedItem[] => {
    const node = edge.node;
    const title = cleanText(node?.frontmatter?.title);
    const path = cleanText(node?.fields?.path || node?.fields?.slug);

    if (!title || !path) {
      return [];
    }

    return [
      {
        sourceId: "evan-moon",
        sourceTitle: "Evans Library",
        title,
        url: new URL(path, SITE_URL).toString(),
        publishedAt: toIsoDate(node?.frontmatter?.date),
        summary: cleanText(node?.frontmatter?.subTitle) || cleanText(node?.excerpt),
      },
    ];
  });

  return {
    items,
    pageCount: Number(markdown?.pageInfo?.pageCount) || 1,
  };
}

export async function collectEvanMoon(fetchText: FetchText): Promise<FeedItem[]> {
  const firstPage = parseEvanPageData(JSON.parse(await fetchText(FIRST_PAGE_DATA_URL)));
  const pageUrls = Array.from({ length: Math.max(0, firstPage.pageCount - 1) }, (_, index) => {
    const page = index + 2;
    return `https://evan-moon.github.io/page-data/posts/page/${page}/page-data.json`;
  });

  const rest = await Promise.all(
    pageUrls.map(async (url) => parseEvanPageData(JSON.parse(await fetchText(url))).items),
  );

  return [...firstPage.items, ...rest.flat()];
}

