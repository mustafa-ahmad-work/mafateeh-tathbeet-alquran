import { MushafEdition } from "../data/mushafEditions";
import { SURAHS } from "../data/quranMeta";
import { toArabicNumerals } from "./helpers";

export interface SurahSegment {
  surahId: number;
  nameAr: string;
  pages: number[];
}

export function buildRanges(pages: number[]): { start: number; end: number }[] {
  if (!pages.length) return [];
  const res: { start: number; end: number }[] = [];
  let s = pages[0],
    e = pages[0];
  for (let i = 1; i < pages.length; i++) {
    if (pages[i] === e + 1) {
      e = pages[i];
    } else {
      res.push({ start: s, end: e });
      s = pages[i];
      e = pages[i];
    }
  }
  res.push({ start: s, end: e });
  return res;
}

export function formatRanges(ranges: { start: number; end: number }[]): string {
  return ranges
    .map((r) =>
      r.start === r.end
        ? toArabicNumerals(r.start)
        : `${toArabicNumerals(r.start)}-${toArabicNumerals(r.end)}`,
    )
    .join(" و ");
}

export function getSurahSegments(
  pages: number[],
  edition: MushafEdition,
): SurahSegment[] {
  const pageSet = new Set(pages);
  const segments: SurahSegment[] = [];

  const surahEntries = Object.entries(edition.surahPages)
    .map(([id, [s, e]]) => ({ id: Number(id), startPage: s, endPage: e }))
    .sort((a, b) => a.id - b.id);

  surahEntries.forEach(({ id, startPage, endPage }) => {
    const surahPages: number[] = [];
    for (let p = startPage; p <= endPage; p++) {
      if (pageSet.has(p)) surahPages.push(p);
    }
    if (surahPages.length > 0) {
      const surahMeta = SURAHS.find((s) => s.id === id);
      segments.push({
        surahId: id,
        nameAr: surahMeta?.nameAr ?? `سورة ${id}`,
        pages: surahPages,
      });
    }
  });

  return segments;
}
