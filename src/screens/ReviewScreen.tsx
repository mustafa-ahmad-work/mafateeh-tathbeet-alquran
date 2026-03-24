import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAppStore } from '../store/AppStore';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTheme, Typography, Spacing, BorderRadius, Shadow } from '../theme';
import { PageProgress, MemorizationStrength } from '../types';
import { getPagesDueForReview } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

type ReviewMode = 'select' | 'short' | 'long' | 'done';

const getStrengthLabels = (Colors: any): Record<
  MemorizationStrength,
  { label: string; color: string; icon: string }
> => ({
  1: { label: 'ضعيف جداً', color: Colors.red, icon: 'sad-outline' },
  2: { label: 'ضعيف', color: Colors.warning, icon: 'warning-outline' },
  3: { label: 'متوسط', color: Colors.blue, icon: 'thumbs-up-outline' },
  4: { label: 'جيد', color: Colors.primary, icon: 'happy-outline' },
  5: { label: 'ممتاز', color: Colors.primaryDark, icon: 'star-outline' },
});

export default function ReviewScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const STRENGTH_LABELS = React.useMemo(() => getStrengthLabels(Colors), [Colors]);

  const { state, dispatch, getPagesDue, getMemorizedPages } = useAppStore();
  const [mode, setMode] = useState<ReviewMode>('select');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [reviewType, setReviewType] = useState<'short' | 'long'>('short');
  const [showRating, setShowRating] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const pagesDue = getPagesDue();
  const memorizedPages = getMemorizedPages();

  const shortReviewPages = memorizedPages
    .slice(-5)
    .reverse();

  const longReviewPages = pagesDue;

  const currentPages =
    reviewType === 'short' ? shortReviewPages : longReviewPages;
  const currentPage = currentPages[currentReviewIndex];

  const handleStartReview = (type: 'short' | 'long') => {
    setReviewType(type);
    setCurrentReviewIndex(0);
    setShowRating(false);
    setReviewedCount(0);
    setMode(type);
  };

  const handleRate = (strength: MemorizationStrength) => {
    if (!currentPage) return;

    dispatch({
      type: 'REVIEW_PAGE',
      payload: {
        pageNumber: currentPage.pageNumber,
        passed: strength >= 3,
      },
    });

    setReviewedCount((c) => c + 1);

    if (currentReviewIndex < currentPages.length - 1) {
      setCurrentReviewIndex((i) => i + 1);
      setShowRating(false);
    } else {
      if (reviewType === 'short') {
        dispatch({ type: 'TOGGLE_FORTRESS', payload: { fortressId: 'review' } });
      }
      setMode('done');
    }
  };

  const handleFinish = () => {
    router.back();
  };

  const strengthBar = (s: MemorizationStrength) => {
    const info = STRENGTH_LABELS[s];
    const widthPct: `${number}%` = `${(s / 5) * 100}%`;
    return (
      <View style={styles.strengthBar}>
        <View style={[styles.strengthFill, { width: widthPct, backgroundColor: info.color }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleFinish} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المراجعة</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* SELECT MODE */}
      {mode === 'select' && (
        <ScrollView
          contentContainerStyle={styles.selectContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.selectTitle}>اختر نوع المراجعة</Text>

          {/* Short Review */}
          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => handleStartReview('short')}
          >
            <LinearGradient
              colors={[`${Colors.blue}15`, `${Colors.blue}08`]}
              style={styles.modeCardGradient}
            >
              <Ionicons name="flash-outline" size={34} color={Colors.primary} style={{ opacity: 0.85 }} />
              <View style={styles.modeCardInfo}>
                <Text style={styles.modeCardTitle}>المراجعة القصيرة</Text>
                <Text style={styles.modeCardDesc}>
                  مراجعة آخر الصفحات المحفوظة
                </Text>
                <View style={styles.modeCardBadge}>
                  <Text style={styles.modeCardBadgeText}>
                    {shortReviewPages.length} صفحة
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Long Review */}
          <TouchableOpacity
            style={[styles.modeCard, longReviewPages.length === 0 && styles.modeCardDisabled]}
            onPress={() => {
              if (longReviewPages.length === 0) {
                Alert.alert('لا يوجد مراجعة', 'لا توجد صفحات تحتاج مراجعة الآن، أحسنت!');
                return;
              }
              handleStartReview('long');
            }}
          >
            <LinearGradient
              colors={[`${Colors.primary}12`, `${Colors.primary}06`]}
              style={styles.modeCardGradient}
            >
              <Ionicons name="sync-outline" size={34} color={Colors.primary} style={{ opacity: 0.85 }} />
              <View style={styles.modeCardInfo}>
                <Text style={styles.modeCardTitle}>المراجعة الطويلة</Text>
                <Text style={styles.modeCardDesc}>
                  مراجعة بنظام التكرار المتباعد
                </Text>
                <View
                  style={[
                    styles.modeCardBadge,
                    longReviewPages.length > 0 && styles.modeCardBadgeWarn,
                  ]}
                >
                  <Text
                    style={[
                      styles.modeCardBadgeText,
                      longReviewPages.length > 0 && { color: Colors.warning },
                    ]}
                  >
                    {longReviewPages.length} صفحة مستحقة
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Strength Heatmap */}
          {memorizedPages.length > 0 && (
            <View style={styles.heatmapSection}>
              <Text style={styles.heatmapTitle}>خريطة القوة</Text>
              <View style={styles.heatmap}>
                {memorizedPages.slice(0, 60).map((page) => (
                  <View
                    key={page.pageNumber}
                    style={[
                      styles.heatCell,
                      {
                        backgroundColor:
                          STRENGTH_LABELS[page.strength as MemorizationStrength].color +
                          '40',
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.heatLegend}>
                {([1, 2, 3, 4, 5] as MemorizationStrength[]).map((s) => (
                  <View key={s} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: STRENGTH_LABELS[s].color },
                      ]}
                    />
                    <Text style={styles.legendText}>{STRENGTH_LABELS[s].label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {memorizedPages.length === 0 && (
            <View style={styles.emptyBox}>
              <Ionicons name="book-outline" size={48} color={Colors.textTertiary} style={{ marginBottom: Spacing.sm, opacity: 0.6 }} />
              <Text style={styles.emptyTitle}>لا توجد صفحات محفوظة بعد</Text>
              <Text style={styles.emptySubtitle}>
                ابدأ بحفظ صفحات جديدة من شاشة الحفظ
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* REVIEW MODE */}
      {(mode === 'short' || mode === 'long') && currentPage && (
        <View style={styles.reviewContainer}>
          {/* Progress */}
          <View style={styles.reviewProgress}>
            <Text style={styles.reviewProgressText}>
              {currentReviewIndex + 1}/{currentPages.length}
            </Text>
            <View style={styles.reviewProgressBarBg}>
              <View
                style={[
                  styles.reviewProgressBar,
                  {
                    width: `${((currentReviewIndex + 1) / currentPages.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* Page Card */}
          <View style={styles.reviewPageCard}>
            <Text style={styles.reviewPageLabel}>صفحة</Text>
            <Text style={styles.reviewPageNumber}>{currentPage.pageNumber}</Text>

            {/* Current strength */}
            <View style={styles.currentStrength}>
              <Text style={styles.currentStrengthLabel}>القوة الحالية</Text>
              <View style={styles.currentStrengthRow}>
                {strengthBar(currentPage.strength)}
                <Text
                  style={[
                    styles.currentStrengthValue,
                    {
                      color:
                        STRENGTH_LABELS[currentPage.strength as MemorizationStrength].color,
                    },
                  ]}
                >
                  {STRENGTH_LABELS[currentPage.strength as MemorizationStrength].label}
                </Text>
              </View>
            </View>

            {/* Review count */}
            <Text style={styles.reviewCount}>
              راجعت هذه الصفحة {currentPage.reviewCount} مرة
            </Text>
          </View>

          {!showRating ? (
            <PrimaryButton
              label="قيّم مراجعتك"
              icon="flag-outline"
              onPress={() => setShowRating(true)}
            />
          ) : (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingTitle}>كيف كانت مراجعتك؟</Text>
              <View style={styles.ratingButtons}>
                {([1, 2, 3, 4, 5] as MemorizationStrength[]).map((s) => {
                  const info = STRENGTH_LABELS[s];
                  return (
                    <TouchableOpacity
                      key={s}
                      onPress={() => handleRate(s)}
                      style={[
                        styles.ratingBtn,
                        { borderColor: info.color + '30', backgroundColor: info.color + '0A' },
                      ]}
                    >
                      <Ionicons name={info.icon as any} size={22} color={info.color} />
                      <Text style={[styles.ratingLabel, { color: info.color }]}>
                        {info.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      )}

      {/* DONE */}
      {mode === 'done' && (
        <View style={styles.doneContainer}>
          <Ionicons name="checkmark-circle-outline" size={64} color={Colors.primary} style={{ marginBottom: Spacing.sm, opacity: 0.9 }} />
          <Text style={styles.doneTitle}>أحسنت!</Text>
          <Text style={styles.doneSubtitle}>
            راجعت {reviewedCount} صفحة بنجاح
          </Text>
          <PrimaryButton
            label="العودة"
            onPress={handleFinish}
            style={styles.doneBtn}
          />
        </View>
      )}
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },

  // SELECT
  selectContainer: {
    padding: Spacing.xl,
    paddingBottom: 100,
    gap: Spacing.md,
  },
  selectTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modeCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  modeCardDisabled: { opacity: 0.4 },
  modeCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    gap: Spacing.base,
  },
  modeCardInfo: { flex: 1, alignItems: 'flex-start', gap: 4 },
  modeCardTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  modeCardDesc: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'left',
  },
  modeCardBadge: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: `${Colors.primary}15`,
  },
  modeCardBadgeWarn: {
    backgroundColor: Colors.goldMuted,
    borderColor: `${Colors.gold}15`,
  },
  modeCardBadgeText: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
  heatmapSection: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  heatmapTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textAlign: 'left',
    marginBottom: Spacing.md,
  },
  heatmap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginBottom: Spacing.md,
  },
  heatCell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  heatLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  emptyBox: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },

  // REVIEW
  reviewContainer: {
    flex: 1,
    padding: Spacing.xl,
    paddingBottom: 100,
    gap: Spacing.lg,
  },
  reviewProgress: {
    gap: Spacing.sm,
  },
  reviewProgressText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  reviewProgressBarBg: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  reviewProgressBar: {
    height: 3,
    backgroundColor: Colors.purple,
    borderRadius: 1.5,
  },
  reviewPageCard: {
    flex: 1,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  reviewPageLabel: {
    fontSize: Typography.base,
    color: Colors.textTertiary,
  },
  reviewPageNumber: {
    fontSize: 70,
    fontWeight: Typography.bold,
    color: Colors.primary,
    lineHeight: 78,
  },
  currentStrength: {
    width: '100%',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  currentStrengthLabel: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  currentStrengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: '80%',
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: 4,
    borderRadius: 2,
  },
  currentStrengthValue: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    minWidth: 56,
    textAlign: 'left',
  },
  reviewCount: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  ratingContainer: {
    gap: Spacing.md,
  },
  ratingTitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ratingBtn: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  ratingLabel: {
    fontSize: 10,
    fontWeight: Typography.medium,
  },

  // DONE
  doneContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    paddingBottom: 100,
    gap: Spacing.md,
  },
  doneTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  doneSubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  doneBtn: { width: '100%', marginTop: Spacing.sm },
});
