import { 
  ref, 
  runTransaction 
} from "firebase/database";
import { rtdb } from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";



export const StatisticsService = {
  /**
   * Tracks a new user registration/onboarding complete - DISABLED
   */
  async trackNewUser() {
    // Disabled to protect user privacy
  },

  /**
   * Track every time the app is opened - DISABLED
   */
  async trackAppLaunch() {
    // Disabled to protect user privacy
  },

  /**
   * Track screen/page views - DISABLED
   */
  async trackPageView(pageName: string) {
    // Disabled to protect user privacy
  },

  /**
   * Increment total tasks completed - DISABLED
   */
  async trackTaskCompletion() {
    // Disabled to protect user privacy
  },

  /**
   * Track when pages are successfully memorized - DISABLED
   */
  async trackPageMemorized(count: number) {
    // Disabled to protect user privacy
  },

  /**
   * Real-time listener for global stats
   */
  subscribeToStats(callback: (stats: any) => void) {
    // Returns dummy or empty stats to prevent UI breakage
    callback({ totalUsers: 0, totalTasks: 0, totalPages: 0 });
    return () => {};
  },

  /**
   * Tracks a unique device installation to RTDB Download Counter only.
   * No personal or device information is sent.
   */
  async trackUniqueInstallation() {
    try {
      // 1. Check if already tracked locally
      const alreadyTracked = await AsyncStorage.getItem("husoon_device_tracked");
      if (alreadyTracked === "true") return;

      // 2. Increment ONLY the anonymous RTDB Download Counter
      const downloadRef = ref(rtdb, 'download-app');
      await runTransaction(downloadRef, (currentValue) => {
        if (currentValue === null || currentValue === undefined) return 1;
        return Number(currentValue) + 1;
      });

      // 3. Mark as tracked locally
      await AsyncStorage.setItem("husoon_device_tracked", "true");
      console.log("[Stats] Anonymous download counted successfully.");
    } catch (e) {
      // Silent fail
    }
  }
};

