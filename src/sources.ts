import type { SourceDefinition } from "./types";

export const DEFAULT_PUBLIC_BASE_URL = "https://woohyun-park.github.io/rss/";
export const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? DEFAULT_PUBLIC_BASE_URL;

export const sourceDefinitions: SourceDefinition[] = [
  {
    id: "evan-moon",
    title: "Evans Library",
    siteUrl: "https://evan-moon.github.io/",
    feedFile: "evan-moon.xml",
  },
  {
    id: "hoseung",
    title: "hoseung.me",
    siteUrl: "https://blog.hoseung.me/",
    feedFile: "hoseung.xml",
  },
  {
    id: "hewon",
    title: "Hewon Jeong",
    siteUrl: "https://hewon.dev/",
    feedFile: "hewon.xml",
  },
  {
    id: "hiddenest",
    title: "hiddenest",
    siteUrl: "https://hiddenest.dev/",
    feedFile: "hiddenest.xml",
  },
  {
    id: "jeong-min",
    title: "개발자 단민",
    siteUrl: "https://jeong-min.com/",
    feedFile: "jeong-min.xml",
  },
  {
    id: "kdy1",
    title: "강동윤 (kdy1)",
    siteUrl: "https://kdy1.dev/",
    feedFile: "kdy1.xml",
  },
  {
    id: "taegon-kim",
    title: "코드쓰는사람",
    siteUrl: "https://taegon.kim/",
    feedFile: "taegon-kim.xml",
  },
];
