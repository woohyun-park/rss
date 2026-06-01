export type SourceId = "evan-moon" | "hoseung" | "hewon" | "hiddenest";

export interface FeedItem {
  sourceId: SourceId;
  sourceTitle: string;
  title: string;
  url: string;
  publishedAt?: string;
  updatedAt?: string;
  summary?: string;
}

export interface SourceDefinition {
  id: SourceId;
  title: string;
  siteUrl: string;
  feedFile: string;
}

