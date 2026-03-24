import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/AppStore';
import { useTheme, Typography, Spacing, BorderRadius, Shadow } from '../theme';
import { MemorizationStrength } from '../types';
import {
  getDailyCompletionPercent,
  getXPProgressToNextLevel,
} from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const getStrengthColors = (Colors: any): Record<MemorizationStrength, string> => ({
  1: Colors.red,
  2: Colors.strength2,
  3: Colors.gold,
  4: Colors.strength4,
  5: Colors.primary,
});

export default function ProgressScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const STRENGTH_COLORS = React.useMemo(() => getStrengthColors(Colors), [Colors]);

  const { state, getMemorizedPages, getPagesDue } = useAppStore();
  const { user, plan, dailyProgress, streak } = state;
  const memorizedPages = getMemorizedPages();
  const pagesDue = getPagesDue();

  const xpProgress = getXPProgressToNextLevel(user?.totalXP ?? 0);

  // Last 7 days completion
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const progress = dailyProgress.find((p) => p.date === dateStr);
    const pct = progress ? getDailyCompletionPercent(progress) : 0;
    const dayName = date.toLocaleDateString('ar-EG', { weekday: 'short' });
    return { date: dateStr, pct, dayName };
  });

  // Strength distribution
  const strengthDist: Record<MemorizationStrength, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  };
  memorizedPages.forEach((p) => {
    strengthDist[p.strength as MemorizationStrength]++;
  });

  const totalPages = plan ? plan.endPage - plan.startPage + 1 : 604;
  const planPct = totalPages > 0 ? memorizedPages.length / totalPages : 0;

  const totalXP = user?.totalXP ?? 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>التقدم والإحصائيات</Text>
        <Text style={styles.headerSubtitle}>رحلتك مع كلام الله</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* User Level & XP */}
        <View style={styles.levelCard}>
          <LinearGradient
            colors={[`${Colors.primary}12`, `${Colors.primary}04`]}
            style={styles.levelGradient}
          >
            <View style={styles.levelLeft}>
              <Ionicons name="trophy-outline" size={32} color={Colors.gold} />
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>{user?.title ?? 'مبتدئ'}</Text>
              <Text style={styles.levelSubtitle}>{user?.name ?? 'الحافظ'}</Text>
              <View style={styles.xpBar}>
                <View style={styles.xpBarBg}>
                  <View
                    style={[
                      styles.xpBarFill,
                      { width: `${xpProgress.percentage * 100}%` },
                    ]}
                  />
                </View>
                <View style={styles.xpRow}>
                  <Text style={styles.xpText}>{xpProgress.current}/{xpProgress.required}</Text>
                  <Ionicons name="star" size={10} color={Colors.textTertiary} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'محفوظ', value: memorizedPages.length, icon: 'book-outline', color: Colors.primary },
            { label: 'للمراجعة', value: pagesDue.length, icon: 'sync-outline', color: Colors.warning },
            { label: 'سلسلة', value: `${streak.currentStreak}`, icon: 'flame-outline', color: Colors.gold },
            { label: 'نقاط', value: totalXP, icon: 'star-outline', color: Colors.purple },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Ionicons name={stat.icon as any} size={18} color={stat.color} style={{ marginBottom: 3, opacity: 0.8 }} />
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Plan Progress */}
        {plan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تقدم الخطة</Text>
            <View style={styles.planCard}>
              <View style={styles.planStats}>
                <View style={styles.planStat}>
                  <Text style={styles.planStatValue}>{memorizedPages.length}</Text>
                  <Text style={styles.planStatLabel}>صفحة محفوظة</Text>
                </View>
                <View style={styles.planStat}>
                  <Text style={styles.planStatValue}>{totalPages - memorizedPages.length}</Text>
                  <Text style={styles.planStatLabel}>صفحة متبقية</Text>
                </View>
                <View style={styles.planStat}>
                  <Text style={styles.planStatValue}>{Math.round(planPct * 100)}%</Text>
                  <Text style={styles.planStatLabel}>مكتمل</Text>
                </View>
              </View>
              <View style={styles.bigBarBg}>
                <View
                  style={[
                    styles.bigBarFill,
                    { width: `${planPct * 100}%` },
                  ]}
                />
              </View>
              <View style={styles.planGoalRow}>
                <Text style={styles.planGoal}>{user?.goal}</Text>
                <Ionicons name="flag-outline" size={12} color={Colors.textTertiary} />
              </View>
            </View>
          </View>
        )}

        {/* Weekly Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نشاط الأسبوع</Text>
          <View style={styles.weekCard}>
            <View style={styles.barchart}>
              {last7Days.map((day, i) => (
                <View key={i} style={styles.barItem}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { height: `${Math.max(day.pct * 100, 5)}%` },
                        day.pct >= 1 && styles.barComplete,
                        day.pct > 0 && day.pct < 1 && styles.barPartial,
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{day.dayName}</Text>
                  {day.pct >= 1 && <Ionicons name="checkmark" size={12} color={Colors.primary} style={{ marginTop: 2, opacity: 0.7 }} />}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Strength Distribution */}
        {memorizedPages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>توزيع القوة</Text>
            <View style={styles.strengthCard}>
              {([1, 2, 3, 4, 5] as MemorizationStrength[]).map((s) => {
                const count = strengthDist[s];
                const pct = memorizedPages.length > 0 ? count / memorizedPages.length : 0;
                const labels: Record<MemorizationStrength, string> = {
                  1: 'ضعيف جداً',
                  2: 'ضعيف',
                  3: 'متوسط',
                  4: 'جيد',
                  5: 'ممتاز',
                };
                return (
                  <View key={s} style={styles.strengthRow}>
                    <Text style={styles.strengthCount}>{count}</Text>
                    <View style={styles.strengthBarBg}>
                      <View
                        style={[
                          styles.strengthBarFill,
                          {
                            width: `${pct * 100}%`,
                            backgroundColor: STRENGTH_COLORS[s],
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.strengthLabel, { color: STRENGTH_COLORS[s] }]}>
                      {labels[s]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Streak Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>السلاسل</Text>
          <View style={styles.streakCard}>
            <View style={styles.streakItem}>
              <Ionicons name="flame-outline" size={28} color={Colors.gold} />
              <View>
                <Text style={styles.streakValue}>{streak.currentStreak} يوم</Text>
                <Text style={styles.streakLabel}>السلسلة الحالية</Text>
              </View>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <Ionicons name="trophy-outline" size={28} color={Colors.gold} />
              <View>
                <Text style={styles.streakValue}>{streak.longestStreak} يوم</Text>
                <Text style={styles.streakLabel}>أطول سلسلة</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Gamification Titles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مسار الألقاب</Text>
          <View style={styles.titlesContainer}>
            {[
              { title: 'مبتدئ', xp: 0, icon: 'star-outline', unlocked: true },
              { title: 'حارس', xp: 500, icon: 'shield-checkmark-outline', unlocked: totalXP >= 500 },
              { title: 'سيد', xp: 2000, icon: 'medal-outline', unlocked: totalXP >= 2000 },
              { title: 'حافظ', xp: 5000, icon: 'ribbon-outline', unlocked: totalXP >= 5000 },
            ].map((t, i) => (
              <View
                key={i}
                style={[
                  styles.titleCard,
                  t.unlocked && styles.titleCardUnlocked,
                ]}
              >
                <Ionicons 
                  name={t.icon as any} 
                  size={30} 
                  color={t.unlocked ? Colors.primary : Colors.textTertiary} 
                  style={{ marginBottom: Spacing.xs, opacity: t.unlocked ? 0.9 : 0.5 }} 
                />
                <Text
                  style={[
                    styles.titleCardName,
                    t.unlocked && { color: Colors.primary },
                  ]}
                >
                  {t.title}
                </Text>
                <View style={styles.titleXpRow}>
                  <Text style={styles.titleCardXP}>{t.xp}</Text>
                  <Ionicons name="star" size={10} color={t.unlocked ? Colors.gold : Colors.textTertiary} />
                </View>
                {t.unlocked && (
                  <View style={styles.titleUnlockedBadge}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                    <Text style={styles.titleUnlockedText}>مفتوح</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    textAlign: 'left',
    marginTop: 3,
  },
  scroll: {
    padding: Spacing.base,
    gap: Spacing.md,
  },

  // Level Card
  levelCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${Colors.primary}15`,
  },
  levelGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.base,
  },
  levelInfo: { flex: 1, alignItems: 'flex-start', gap: 3 },
  levelTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.primary,
  },
  levelSubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  xpBar: {
    width: '100%',
    gap: 3,
  },
  xpBarBg: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 3,
  },
  xpText: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'left',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  levelLeft: {
    backgroundColor: `${Colors.primary}0A`,
    width: 60,
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${Colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'center',
  },

  // Section
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textAlign: 'left',
  },

  // Plan Card
  planCard: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  planStat: { alignItems: 'center', gap: 3 },
  planStatValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  planStatLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  bigBarBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bigBarFill: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  planGoalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  planGoal: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    textAlign: 'left',
  },

  // Weekly Chart
  weekCard: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.base,
  },
  barchart: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: 110,
    gap: 6,
    paddingBottom: 24,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    gap: 3,
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: Colors.border,
    borderRadius: 3,
    minHeight: 3,
  },
  barComplete: { backgroundColor: Colors.primary },
  barPartial: { backgroundColor: Colors.primaryDark },
  dayLabel: {
    fontSize: 9,
    color: Colors.textTertiary,
    position: 'absolute',
    bottom: 0,
  },

  // Strength
  strengthCard: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  strengthCount: {
    width: 22,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  strengthBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: 6,
    borderRadius: 3,
  },
  strengthLabel: {
    width: 56,
    fontSize: Typography.xs,
    textAlign: 'left',
  },

  // Streak
  streakCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: `${Colors.gold}12`,
    backgroundColor: Colors.goldMuted,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  streakItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  streakValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.gold,
  },
  streakLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: `${Colors.gold}15`,
  },

  // Titles
  titlesContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  titleCard: {
    flex: 1,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 3,
    opacity: 0.5,
  },
  titleCardUnlocked: {
    borderColor: `${Colors.primary}20`,
    backgroundColor: Colors.primaryMuted,
    opacity: 1,
  },
  titleCardName: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  titleXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  titleCardXP: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  titleUnlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  titleUnlockedText: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: Typography.semibold,
  },
});
