const MONTHS: Map<string, number> = new Map(
  [
    ["jan", 0],
    ["january", 0],
    ["feb", 1],
    ["february", 1],
    ["mar", 2],
    ["march", 2],
    ["apr", 3],
    ["april", 3],
    ["may", 4],
    ["jun", 5],
    ["june", 5],
    ["jul", 6],
    ["july", 6],
    ["aug", 7],
    ["august", 7],
    ["sep", 8],
    ["sept", 8],
    ["september", 8],
    ["oct", 9],
    ["october", 9],
    ["nov", 10],
    ["november", 10],
    ["dec", 11],
    ["december", 11],
  ] as const,
);

export function toIsoDate(value: Date | string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  const text = value.trim();
  if (!text) {
    return undefined;
  }

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).toISOString();
  }

  const englishDate = /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/.exec(text);
  if (englishDate) {
    const [, monthText, day, year] = englishDate;
    const month = MONTHS.get(monthText.toLowerCase());
    if (month !== undefined) {
      return new Date(Date.UTC(Number(year), month, Number(day))).toISOString();
    }
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function timestampFor(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}
