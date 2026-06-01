export type FetchText = (url: string) => Promise<string>;

export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "woohyun-park/rss-generator (+https://github.com/woohyun-park/rss)",
      accept: "text/html,application/xhtml+xml,application/xml,text/xml,application/json;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status} ${response.statusText}`);
  }

  return response.text();
}

