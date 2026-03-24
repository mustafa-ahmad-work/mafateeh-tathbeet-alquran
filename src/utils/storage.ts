// Storage utility - simple in-memory implementation
// Replace with MMKV or AsyncStorage in production

const storage: Record<string, string> = {};

export const Storage = {
  set: (key: string, value: unknown): void => {
    try {
      storage[key] = JSON.stringify(value);
    } catch (e) {
      console.error('[Storage] set error:', e);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const item = storage[key];
      if (item === undefined || item === null) return null;
      return JSON.parse(item) as T;
    } catch (e) {
      console.error('[Storage] get error:', e);
      return null;
    }
  },

  delete: (key: string): void => {
    delete storage[key];
  },

  clear: (): void => {
    Object.keys(storage).forEach((key) => delete storage[key]);
  },
};
