import quranData from "../data/quran_pages.json";

export interface Verse {
  verse_key: string;
  text_uthmani: string;
}

const typedQuranData = quranData as Record<string, Verse[]>;

export const QuranStore = {
  /**
   * Get verses for a specific page from local bundled data.
   */
  getVerses: async (pageNumber: number): Promise<Verse[]> => {
    try {
      const pageStr = String(pageNumber);
      if (typedQuranData[pageStr]) {
        return typedQuranData[pageStr];
      }
      console.warn(`[QuranStore] Page ${pageNumber} not found in local data`);
      return [];
    } catch (e) {
      console.error(`[QuranStore] Error getting verses for page ${pageNumber}:`, e);
      return [];
    }
  },

  /**
   * Compatibility method - no longer needed with local data
   */
  getCache: async (): Promise<Record<number, Verse[]>> => {
    return {};
  },

  /**
   * Compatibility method - no longer needed
   */
  cachePages: async () => {
    return Promise.resolve();
  }
};

