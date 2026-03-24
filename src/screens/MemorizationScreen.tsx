import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAppStore } from '../store/AppStore';
import { PrimaryButton } from '../components/PrimaryButton';
import { useTheme, Typography, Spacing, BorderRadius, Shadow } from '../theme';
import { formatTime } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const MIN_SESSION_SECONDS = 15 * 60; // 15 minutes

type Phase = 'ready' | 'memorizing' | 'done';

export default function MemorizationScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const { state, dispatch, getCurrentPagesForMemorization } = useAppStore();
  const pages = getCurrentPagesForMemorization();
  const { plan } = state;

  const [phase, setPhase] = useState<Phase>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [canFinish, setCanFinish] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Subtle pulse animation for timer
  useEffect(() => {
    if (phase === 'memorizing') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [phase]);

  // Timer
  useEffect(() => {
    if (phase === 'memorizing') {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= MIN_SESSION_SECONDS) setCanFinish(true);
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const handleStart = () => {
    setPhase('memorizing');
    setElapsed(0);
    setCanFinish(false);
  };

  const handleMarkMemorized = () => {
    if (!canFinish) {
      Alert.alert(
        'لم تكتمل المدة بعد',
        `يجب الاستمرار على الأقل ${Math.ceil(
          (MIN_SESSION_SECONDS - elapsed) / 60
        )} دقائق إضافية`,
        [{ text: 'حسناً', style: 'cancel' }]
      );
      return;
    }

    if (pages.length > 0) {
      dispatch({
        type: 'MARK_PAGES_MEMORIZED',
        payload: { pages },
      });
      dispatch({
        type: 'TOGGLE_FORTRESS',
        payload: { fortressId: 'memorization' },
      });
    }

    setPhase('done');
  };

  const handleRepeat = () => {
    setRepeatCount((prev) => prev + 1);
    setCurrentPageIndex(0);
  };

  const handleFinish = () => {
    router.back();
  };

  const progressPct = Math.min(elapsed / MIN_SESSION_SECONDS, 1);
  const currentPage = pages[currentPageIndex] ?? (plan?.currentPage ?? 1);

  if (pages.length === 0 && plan) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[Colors.background, Colors.surfaceElevated]} style={StyleSheet.absoluteFill} />
        <View style={styles.emptyContainer}>
          <Ionicons name="medal-outline" size={52} color={Colors.primary} style={{ marginBottom: Spacing.sm }} />
          <Text style={styles.emptyTitle}>أحسنت!</Text>
          <Text style={styles.emptySubtitle}>لقد أتممت خطة الحفظ لهذا الجزء</Text>
          <PrimaryButton label="العودة للرئيسية" onPress={handleFinish} style={styles.backButton} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden />
      <LinearGradient
        colors={[
          Colors.background,
          Colors.surface, // Replaced hardcoded #0A0F18
          Colors.background,
        ]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle top decoration */}
      <View style={styles.patternTop} />

      {/* PHASE: Ready */}
      {phase === 'ready' && (
        <Animated.View style={[styles.phaseContainer, { opacity: fadeAnim }]}>
          {/* Close */}
          <TouchableOpacity onPress={handleFinish} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>

          <Ionicons name="shield-checkmark-outline" size={56} color={Colors.primary} style={{ marginBottom: Spacing.lg, opacity: 0.9 }} />
          <Text style={styles.readyTitle}>وقت الحفظ</Text>
          <Text style={styles.readySubtitle}>
            الجلسة الفعّالة تستغرق ١٥ دقيقة على الأقل
          </Text>

          {/* Pages Info */}
          <View style={styles.pagesInfo}>
            <Text style={styles.pagesLabel}>الصفحات المقررة اليوم</Text>
            <Text style={styles.pagesNumbers}>
              {pages.join(' — ')}
            </Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsList}>
            {[
              { icon: 'notifications-off-outline', text: 'ضع هاتفك في وضع الصمت' },
              { icon: 'cafe-outline', text: 'اجلس في مكان هادئ' },
              { icon: 'water-outline', text: 'توضأ قبل الحفظ' },
              { icon: 'book-outline', text: 'ابدأ بالبسملة' },
            ].map((tip, i) => (
              <View key={i} style={styles.tipItem}>
                <Ionicons name={tip.icon as any} size={18} color={Colors.primary} style={{ opacity: 0.7 }} />
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            ))}
          </View>

          <PrimaryButton
            label="ابدأ جلسة الحفظ"
            onPress={handleStart}
            style={styles.startBtn}
          />
        </Animated.View>
      )}

      {/* PHASE: Memorizing */}
      {phase === 'memorizing' && (
        <View style={styles.sessionContainer}>
          {/* Timer Ring */}
          <Animated.View
            style={[styles.timerRing, { transform: [{ scale: pulseAnim }] }]}
          >
            <View
              style={[
                styles.timerInner,
                canFinish && { borderColor: Colors.primary },
              ]}
            >
              <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
              <Text style={styles.timerLabel}>
                {canFinish ? 'يمكنك الانهاء' : `دقيقة ${Math.floor(elapsed/60)} من ١٥`}
              </Text>
            </View>

            {/* Progress Arc (simulated) */}
            <View
              style={[
                styles.timerProgress,
                {
                  borderColor: canFinish ? Colors.primary : Colors.primaryDark,
                  opacity: 0.2 + progressPct * 0.6,
                },
              ]}
            />
          </Animated.View>

          {/* Current Page Display */}
          <View style={styles.pageDisplay}>
            <Text style={styles.pageDisplayLabel}>الصفحة الحالية</Text>
            <Text style={styles.pageDisplayNumber}>
              {String(currentPage).padStart(3, '٠')}
            </Text>
            <View style={styles.pageNav}>
              <TouchableOpacity
                style={styles.pageNavBtn}
                onPress={() =>
                  setCurrentPageIndex((p) => Math.max(0, p - 1))
                }
                disabled={currentPageIndex === 0}
              >
                <Text style={styles.pageNavText}>→</Text>
              </TouchableOpacity>
              <Text style={styles.pageNavCount}>
                {currentPageIndex + 1}/{pages.length}
              </Text>
              <TouchableOpacity
                style={styles.pageNavBtn}
                onPress={() =>
                  setCurrentPageIndex((p) =>
                    Math.min(pages.length - 1, p + 1)
                  )
                }
                disabled={currentPageIndex === pages.length - 1}
              >
                <Text style={styles.pageNavText}>←</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Repeat Counter */}
          <View style={styles.repeatInfo}>
            <Text style={styles.repeatText}>
              عدد مرات التكرار: {repeatCount}
            </Text>
            <TouchableOpacity onPress={handleRepeat} style={styles.repeatBtn}>
              <Ionicons name="sync-outline" size={14} color={Colors.textPrimary} />
              <Text style={styles.repeatBtnText}>كرّر من البداية</Text>
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={styles.sessionActions}>
            <PrimaryButton
              label={canFinish ? 'تم الحفظ' : `انتظر... ${formatTime(MIN_SESSION_SECONDS - elapsed)}`}
              onPress={handleMarkMemorized}
              disabled={!canFinish}
              style={styles.doneBtn}
            />
            <TouchableOpacity
              onPress={() => {
                Alert.alert('إيقاف الجلسة', 'هل تريد إيقاف الجلسة؟', [
                  { text: 'لا', style: 'cancel' },
                  {
                    text: 'نعم',
                    onPress: () => {
                      setPhase('ready');
                      setElapsed(0);
                    },
                  },
                ]);
              }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>إيقاف</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* PHASE: Done */}
      {phase === 'done' && (
        <View style={styles.doneContainer}>
          <Ionicons name="medal-outline" size={64} color={Colors.primary} style={{ marginBottom: Spacing.sm, opacity: 0.9 }} />
          <Text style={styles.doneTitle}>أحسنت!</Text>
          <Text style={styles.doneSubtitle}>
            لقد حفظت {pages.length} صفحة{'\n'}ووقت جلستك: {formatTime(elapsed)}
          </Text>

          {/* XP Gained */}
          <View style={styles.xpGained}>
            <View style={styles.xpGainedRow}>
              <Ionicons name="star" size={16} color={Colors.gold} />
              <Text style={styles.xpGainedText}>+50 نقطة خبرة</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.doneStats}>
            <View style={styles.doneStat}>
              <Text style={styles.doneStatValue}>{pages.length}</Text>
              <Text style={styles.doneStatLabel}>صفحات محفوظة</Text>
            </View>
            <View style={styles.doneStatDivider} />
            <View style={styles.doneStat}>
              <Text style={styles.doneStatValue}>{repeatCount}</Text>
              <Text style={styles.doneStatLabel}>مرات التكرار</Text>
            </View>
            <View style={styles.doneStatDivider} />
            <View style={styles.doneStat}>
              <Text style={styles.doneStatValue}>{Math.floor(elapsed / 60)}د</Text>
              <Text style={styles.doneStatLabel}>وقت الجلسة</Text>
            </View>
          </View>

          <PrimaryButton
            label="العودة للرئيسية"
            onPress={handleFinish}
            style={styles.finishBtn}
          />
        </View>
      )}
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  patternTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: `${Colors.primary}04`,
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 180,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  emptySubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  backButton: { marginTop: Spacing.xl, width: '100%' },

  // READY PHASE
  phaseContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    paddingTop: 80,
    paddingBottom: 100,
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    left: Spacing.xl,
    width: 36,
    height: 36,
    backgroundColor: Colors.glass,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  readySubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  pagesInfo: {
    width: '100%',
    backgroundColor: Colors.primaryMuted,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: `${Colors.primary}15`,
    padding: Spacing.base,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  pagesLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  pagesNumbers: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.primary,
  },
  tipsList: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
  },
  tipText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'left',
  },
  startBtn: { width: '100%' },

  // SESSION PHASE
  sessionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 40,
    paddingBottom: 100,
  },
  timerRing: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerProgress: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timerInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  pageDisplay: {
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.lg,
    width: '100%',
  },
  pageDisplayLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  pageDisplayNumber: {
    fontSize: 60,
    fontWeight: Typography.bold,
    color: Colors.primary,
    lineHeight: 68,
  },
  pageNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.md,
  },
  pageNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNavText: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
  },
  pageNavCount: {
    color: Colors.textTertiary,
    fontSize: Typography.sm,
  },
  repeatInfo: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  repeatText: {
    color: Colors.textTertiary,
    fontSize: Typography.sm,
  },
  repeatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  repeatBtnText: {
    color: Colors.textPrimary,
    fontSize: Typography.sm,
  },
  sessionActions: {
    width: '100%',
    gap: Spacing.md,
  },
  doneBtn: { width: '100%' },
  cancelBtn: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  cancelBtnText: {
    color: Colors.textTertiary,
    fontSize: Typography.sm,
  },

  // DONE PHASE
  doneContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    paddingBottom: 100,
    gap: Spacing.md,
  },
  doneTitle: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  doneSubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.base * 1.7,
  },
  xpGained: {
    backgroundColor: Colors.goldMuted,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: `${Colors.gold}18`,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  xpGainedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  xpGainedText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gold,
  },
  doneStats: {
    flexDirection: 'row',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.lg,
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  doneStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  doneStatValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  doneStatLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  doneStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  finishBtn: { width: '100%', marginTop: Spacing.sm },
});
