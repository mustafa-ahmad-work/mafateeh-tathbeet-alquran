import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  I18nManager,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import "../global.css";
import { AppProvider } from "../src/store/AppStore";
import { useTheme, Typography, Spacing, BorderRadius } from "../src/theme";
import { StatisticsService } from "../src/store/StatisticsService";
import { UpdateService, UpdateInfo } from "../src/store/UpdateService";
import VersionOverlay from "../src/components/VersionOverlay";

// Force RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);


const { width, height } = Dimensions.get("window");

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

function MainLayout() {
  const Colors = useTheme();
  const pathname = usePathname();

  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [blockType, setBlockType] = useState<
    "disabled" | "force_update" | "optional_update" | null
  >(null);

  useEffect(() => {
    async function checkVersion() {
      try {
        const info = await UpdateService.checkForUpdate();
        if (info) {
          setUpdateInfo(info);
          if (info.isAppDisabled) setBlockType("disabled");
          else if (info.isMandatory) setBlockType("force_update");
          else if (info.hasUpdate) setBlockType("optional_update");
        }
      } catch (err) {
        console.warn("[RootLayout] Update check failed:", err);
      }
    }
    checkVersion();
  }, []);

  // Track page views
  useEffect(() => {
    if (pathname) {
      StatisticsService.trackPageView(pathname);
    }
  }, [pathname]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle={Colors.background === "#07090F" ? "light-content" : "dark-content"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />

      {updateInfo && blockType && (
        <VersionOverlay
          type={blockType}
          info={updateInfo}
          onDismiss={() => setBlockType(null)}
        />
      )}
    </View>
  );
}

