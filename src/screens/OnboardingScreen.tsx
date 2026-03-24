import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAppStore } from "../store/AppStore";
import { BorderRadius, Spacing, Typography, useTheme } from "../theme";
import { QURAN_GOALS, UserLevel } from "../types";

const { width } = Dimensions.get("window");

const LEVELS: {
  value: UserLevel;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "مبتدئ",
    label: "مبتدئ",
    icon: "star-outline",
    description: "لم أحفظ شيئاً بعد",
  },
  {
    value: "متوسط",
    label: "متوسط",
    icon: "star-half-outline",
    description: "حفظت بعض الأجزاء",
  },
  {
    value: "متقدم",
    label: "متقدم",
    icon: "star",
    description: "حفظت أكثر من نصف القرآن",
  },
];

const DAILY_PAGES = [0.5, 1, 2, 3, 5];
const DAILY_PAGES_LABELS: Record<number, string> = {
  0.5: "نصف صفحة",
  1: "صفحة واحدة",
  2: "صفحتان",
  3: "٣ صفحات",
  5: "٥ صفحات",
};

const STEPS = ["الترحيب", "مستواك", "هدفك", "طاقتك", "البداية"];

export default function OnboardingScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const { dispatch } = useAppStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>("مبتدئ");
  const [selectedGoal, setSelectedGoal] = useState(QURAN_GOALS[0]);
  const [customGoal, setCustomGoal] = useState("");
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [selectedPages, setSelectedPages] = useState<number>(1);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateToStep = (nextStep: number) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -15,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    setStep(nextStep);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      animateToStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) animateToStep(step - 1);
  };

  const handleFinish = () => {
    dispatch({
      type: "COMPLETE_ONBOARDING",
      payload: {
        user: {
          name: name || "أخي الحافظ",
          level: selectedLevel,
          dailyPages: selectedPages,
          goal: isCustomGoal && customGoal ? customGoal : selectedGoal,
        },
        goal: isCustomGoal && customGoal ? customGoal : selectedGoal,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.replace("/(tabs)/dashboard" as any);
  };

  const canProceed = () => {
    if (step === 0) return true;
    return true;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[
          Colors.background,
          Colors.surface, // Replaced hardcoded #0A0F18
          Colors.background,
        ]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle decorative orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Header - Step Indicator */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backButton, step === 0 && { opacity: 0 }]}
          disabled={step === 0}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.steps}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i === step && styles.stepDotActive,
                i < step && styles.stepDotDone,
              ]}
            />
          ))}
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* STEP 0: Welcome */}
          {step === 0 && (
            <View style={styles.stepContainer}>
              <View style={styles.logoCircleIntro}>
                <Ionicons
                  name="shield-checkmark"
                  size={54}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.stepTitle}>مرحباً بك في</Text>
              <Text style={styles.appName}>الحصون الخمسة</Text>
              <Text style={styles.appSubtitle}></Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>ما اسمك؟ (اختياري)</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="أدخل اسمك..."
                  placeholderTextColor={Colors.textTertiary}
                  textAlign="right"
                />
              </View>

              <View style={styles.featuresList}>
                {[
                  {
                    icon: "shield-checkmark-outline",
                    text: "نظام الحصون الخمسة المتكامل",
                  },
                  {
                    icon: "sync-outline",
                    text: "مراجعة ذكية بالتكرار المتباعد",
                  },
                  {
                    icon: "stats-chart-outline",
                    text: "تتبع التقدم والإنجازات",
                  },
                  { icon: "flame-outline", text: "نظام السلاسل والمكافآت" },
                ].map((f, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons
                      name={f.icon as any}
                      size={20}
                      color={Colors.primary}
                      style={{ opacity: 0.75 }}
                    />
                    <Text style={styles.featureText}>{f.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* STEP 1: Level */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Ionicons
                name="book-outline"
                size={48}
                color={Colors.primary}
                style={{ marginBottom: Spacing.lg, opacity: 0.85 }}
              />
              <Text style={styles.stepTitle}>ما مستواك الحالي؟</Text>
              <Text style={styles.stepSubtitle}>
                سيساعدنا ذلك في تخصيص خطتك
              </Text>

              {LEVELS.map((lvl) => (
                <TouchableOpacity
                  key={lvl.value}
                  style={[
                    styles.optionCard,
                    selectedLevel === lvl.value && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedLevel(lvl.value)}
                >
                  <Ionicons
                    name={lvl.icon as any}
                    size={24}
                    color={
                      selectedLevel === lvl.value
                        ? Colors.primary
                        : Colors.textTertiary
                    }
                  />
                  <View style={styles.optionInfo}>
                    <Text
                      style={[
                        styles.optionLabel,
                        selectedLevel === lvl.value && {
                          color: Colors.primary,
                        },
                      ]}
                    >
                      {lvl.label}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {lvl.description}
                    </Text>
                  </View>
                  {selectedLevel === lvl.value && (
                    <View style={styles.selectedCheck}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* STEP 2: Goal */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Ionicons
                name="flag-outline"
                size={48}
                color={Colors.primary}
                style={{ marginBottom: Spacing.lg, opacity: 0.85 }}
              />
              <Text style={styles.stepTitle}>ما هدفك؟</Text>
              <Text style={styles.stepSubtitle}>اختر ما تريد حفظه</Text>

              {QURAN_GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.goalCard,
                    !isCustomGoal &&
                      selectedGoal === goal &&
                      styles.optionCardSelected,
                  ]}
                  onPress={() => {
                    setIsCustomGoal(false);
                    setSelectedGoal(goal);
                  }}
                >
                  <Text
                    style={[
                      styles.goalText,
                      !isCustomGoal &&
                        selectedGoal === goal && { color: Colors.primary },
                    ]}
                  >
                    {goal}
                  </Text>
                  {!isCustomGoal && selectedGoal === goal && (
                    <View style={styles.selectedCheck}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.goalCard,
                  isCustomGoal && styles.optionCardSelected,
                ]}
                onPress={() => setIsCustomGoal(true)}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.goalText,
                      isCustomGoal && { color: Colors.primary },
                    ]}
                  >
                    تحديد هدف خاص...
                  </Text>
                  {isCustomGoal && (
                    <TextInput
                      style={[
                        styles.input,
                        { marginTop: Spacing.sm, textAlign: "right" },
                      ]}
                      value={customGoal}
                      onChangeText={setCustomGoal}
                      placeholder="اكتب هدفك هنا (مثل: سورة البقرة، 3 أجزاء...)"
                      placeholderTextColor={Colors.textTertiary}
                    />
                  )}
                </View>
                {isCustomGoal && (
                  <View style={styles.selectedCheck}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Daily Capacity */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <Ionicons
                name="flash-outline"
                size={48}
                color={Colors.primary}
                style={{ marginBottom: Spacing.lg, opacity: 0.85 }}
              />
              <Text style={styles.stepTitle}>طاقتك اليومية</Text>
              <Text style={styles.stepSubtitle}>
                كم صفحة تستطيع حفظها يومياً؟
              </Text>

              <View style={styles.pagesGrid}>
                {DAILY_PAGES.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.pageOption,
                      selectedPages === p && styles.pageOptionSelected,
                    ]}
                    onPress={() => setSelectedPages(p)}
                  >
                    <Text
                      style={[
                        styles.pageNum,
                        selectedPages === p && { color: Colors.primary },
                      ]}
                    >
                      {p}
                    </Text>
                    <Text style={styles.pageLabel}>
                      {DAILY_PAGES_LABELS[p]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.estimateBox}>
                <Text style={styles.estimateLabel}>التقدير</Text>
                <Text style={styles.estimateValue}>
                  {selectedGoal && selectedPages > 0
                    ? `تقريباً ${Math.ceil(
                        (() => {
                          const range = {
                            "القرآن الكريم كاملاً": 604,
                            "الجزء الثلاثون (عمّ)": 23,
                            "الجزء التاسع والعشرون": 20,
                            "الجزء الثامن والعشرون": 20,
                            "خمسة أجزاء": 100,
                            "عشرة أجزاء": 200,
                            "خمسة عشر جزءاً": 300,
                            "عشرون جزءاً": 400,
                          };
                          return (
                            (range[selectedGoal as keyof typeof range] ?? 100) /
                            selectedPages
                          );
                        })(),
                      )} يوم`
                    : "—"}
                </Text>
              </View>
            </View>
          )}

          {/* STEP 4: Ready */}
          {step === 4 && (
            <View style={styles.stepContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={64}
                color={Colors.primary}
                style={{ marginBottom: Spacing.lg, opacity: 0.85 }}
              />
              <Text style={styles.stepTitle}>أنت مستعد!</Text>
              <Text style={styles.stepSubtitle}>
                رحلتك مع كلام الله تبدأ الآن
              </Text>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>ملخص خطتك</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>الاسم</Text>
                  <Text style={styles.summaryValue}>
                    {name || "أخي الحافظ"}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>المستوى</Text>
                  <Text style={styles.summaryValue}>{selectedLevel}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>الهدف</Text>
                  <Text style={styles.summaryValue}>
                    {isCustomGoal && customGoal ? customGoal : selectedGoal}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>يومياً</Text>
                  <Text style={styles.summaryValue}>
                    {DAILY_PAGES_LABELS[selectedPages]}
                  </Text>
                </View>
              </View>

              <Text style={styles.hadith}>
                "اقرأ وارقَ ورتِّل كما كنتَ تُرتِّلُ في الدنيا"
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          label={step === STEPS.length - 1 ? "ابدأ رحلتك" : "التالي"}
          onPress={handleNext}
          disabled={!canProceed()}
        />
      </View>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    orb1: {
      position: "absolute",
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: `${Colors.primary}05`,
      top: -100,
      right: -80,
    },
    orb2: {
      position: "absolute",
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: `${Colors.blue}04`,
      bottom: 100,
      left: -60,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 56,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.base,
    },
    backButton: {
      width: 40,
      height: 40,
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    steps: {
      flexDirection: "row",
      gap: 6,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors.border,
    },
    stepDotActive: {
      width: 20,
      backgroundColor: Colors.primary,
    },
    stepDotDone: {
      backgroundColor: Colors.primaryDark,
    },
    content: {
      flex: 1,
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing["4xl"],
    },
    stepContainer: {
      alignItems: "center",
      paddingTop: Spacing.xl,
    },
    stepTitle: {
      fontSize: Typography["2xl"],
      fontWeight: Typography.bold,
      color: Colors.textPrimary,
      textAlign: "center",
      marginBottom: Spacing.sm,
    },
    appName: {
      fontSize: Typography["3xl"],
      fontWeight: Typography.extrabold,
      color: Colors.primary,
      textAlign: "center",
    },
    appSubtitle: {
      fontSize: Typography.base,
      color: Colors.textSecondary,
      textAlign: "center",
      marginTop: Spacing.sm,
      marginBottom: Spacing["sm"],
    },
    stepSubtitle: {
      fontSize: Typography.base,
      color: Colors.textSecondary,
      textAlign: "center",
      marginBottom: Spacing.xl,
    },
    inputContainer: {
      width: "100%",
      marginBottom: Spacing.xl,
    },
    inputLabel: {
      fontSize: Typography.sm,
      color: Colors.textTertiary,
      textAlign: "left",
      marginBottom: Spacing.sm,
    },
    input: {
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.md,
      color: Colors.textPrimary,
      fontSize: Typography.base,
      textAlign: "right",
    },
    featuresList: {
      width: "100%",
      gap: Spacing.sm,
    },
    featureItem: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.md,
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.md,
    },
    featureText: {
      fontSize: Typography.sm,
      color: Colors.textSecondary,
      flex: 1,
      textAlign: "left",
    },
    optionCard: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.base,
      marginBottom: Spacing.sm,
      gap: Spacing.md,
    },
    optionCardSelected: {
      borderColor: `${Colors.primary}40`,
      backgroundColor: Colors.primaryMuted,
    },
    optionInfo: {
      flex: 1,
      alignItems: "flex",
    },
    optionLabel: {
      fontSize: Typography.base,
      fontWeight: Typography.medium,
      color: Colors.textPrimary,
    },
    optionDescription: {
      fontSize: Typography.sm,
      color: Colors.textTertiary,
      marginTop: 2,
    },
    selectedCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    goalCard: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.md,
      marginBottom: Spacing.sm,
    },
    goalText: {
      fontSize: Typography.base,
      color: Colors.textPrimary,
      textAlign: "left",
      flex: 1,
    },
    pagesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
      justifyContent: "center",
      width: "100%",
      marginBottom: Spacing.xl,
    },
    pageOption: {
      width: (width - Spacing.xl * 2 - Spacing.sm * 2) / 3,
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      alignItems: "center",
      paddingVertical: Spacing.base,
      gap: 3,
    },
    pageOptionSelected: {
      borderColor: `${Colors.primary}40`,
      backgroundColor: Colors.primaryMuted,
    },
    pageNum: {
      fontSize: Typography.lg,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
    },
    pageLabel: {
      fontSize: 10,
      color: Colors.textTertiary,
      textAlign: "center",
    },
    estimateBox: {
      width: "100%",
      backgroundColor: Colors.primarySubtle,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: `${Colors.primary}0D`,
      padding: Spacing.base,
      alignItems: "center",
    },
    estimateLabel: {
      fontSize: Typography.sm,
      color: Colors.textSecondary,
      marginBottom: 3,
    },
    estimateValue: {
      fontSize: Typography.lg,
      fontWeight: Typography.semibold,
      color: Colors.primary,
    },
    summaryBox: {
      width: "100%",
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
      gap: Spacing.sm,
    },
    summaryTitle: {
      fontSize: Typography.base,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
      textAlign: "left",
      marginBottom: Spacing.sm,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    summaryLabel: {
      fontSize: Typography.sm,
      color: Colors.textTertiary,
      textAlign: "right",
    },
    summaryValue: {
      fontSize: Typography.sm,
      fontWeight: Typography.medium,
      color: Colors.textPrimary,
      textAlign: "right",
    },
    hadith: {
      fontSize: Typography.base,
      color: Colors.primary,
      textAlign: "center",
      fontStyle: "italic",
      lineHeight: Typography.base * 1.8,
      paddingHorizontal: Spacing.lg,
      opacity: 0.8,
    },
    footer: {
      paddingHorizontal: Spacing.xl,
      paddingBottom: 36,
      paddingTop: Spacing.base,
    },
    logoCircleIntro: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: Colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.xl,
      borderWidth: 1,
      borderColor: `${Colors.primary}20`,
    },
  });
