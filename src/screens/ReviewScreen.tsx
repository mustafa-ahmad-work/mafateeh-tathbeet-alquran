import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming 
} from "react-native-reanimated";
import { BorderRadius, Shadow, Spacing, Typography, useTheme } from "../theme";
import { toArabicNumerals } from "../utils/helpers";

const { width } = Dimensions.get("window");

type VirtueItem = {
  id: string;
  title: string;
  desc: string;
  icon: any;
  color: string;
  category: 'akhira' | 'dunya' | 'parent';
};

const VIRTUES: VirtueItem[] = [
  {
    id: "ahlAllah",
    category: 'akhira',
    title: "أهل الله وخاصته",
    desc: "للهِ أهلُونَ منَ النَّاسِ، وقيل من هم يا رسول الله؟ قال: أهلُ القُرآنِ هُم أهلُ اللهِ وخاصَّتُهُ.",
    icon: "heart",
    color: "#E91E63",
  },
  {
    id: "crown",
    category: 'parent',
    title: "تاج الوقار لوالديك",
    desc: "يُلبَس والدا حافظ القرآن تاجاً ضوؤه أحسن من ضوء الشمس، ويُقال لصاحبه: اقرأ وارقَ ورتِّل.",
    icon: "ribbon",
    color: "#FFD700",
  },
  {
    id: "elevation",
    category: 'akhira',
    title: "منزلك عند آخر آية",
    desc: "يقال لصاحب القرآن يوم القيامة اقرأ وارتقِ، فإن منزلتك عند آخر آية تقرؤها.",
    icon: "trending-up",
    color: "#2196F3",
  },
  {
    id: "shafaa",
    category: 'akhira',
    title: "شفاعة لا ترد",
    desc: "حُلة الكرامة وتاج الكرامة، والشفاعة في الأهل.. كلها بانتظار من أخلص مع كتاب الله.",
    icon: "shield-checkmark",
    color: "#4CAF50",
  },
  {
    id: "memory",
    category: 'dunya',
    title: "حدة الذهن والذكاء",
    desc: "حفظ القرآن يُقوي الذاكرة وينشط خلايا الدماغ ويحمي من أمراض الشيخوخة وفقدان التركيز.",
    icon: "flash",
    color: "#FF9800",
  },
  {
    id: "peace",
    category: 'dunya',
    title: "سكينة القلب ونور الوجه",
    desc: "«ألا بذكر الله تطمئن القلوب»، والقرآن هو أعظم الذكر، يورث صاحبه وقاراً ونوراً في وجهه.",
    icon: "sunny",
    color: "#00BCD4",
  },
  {
    id: "barakah",
    category: 'dunya',
    title: "بركة الوقت والرزق",
    desc: "من اشتغل بالقرآن بارك الله له في وقته وعمله، وسخر له من أسباب الخير ما لا يحتسب.",
    icon: "leaf",
    color: "#8BC34A",
  },
  {
    id: "protection",
    category: 'dunya',
    title: "حصن من الهموم",
    desc: "القرآن أنيس الروح وجلاء الحزن، من تمسك به في شدته وجد مخرجاً وراحة لا توصف.",
    icon: "umbrella",
    color: "#607D8B",
  },
];

const HADITHS = [
  { text: "خيركم من تعلم القرآن وعلمه", author: "رسول الله ﷺ" },
  { text: "إنَّ الذي ليس في جَوْفِهِ شيءٌ من القرآن كَالبيتِ الخَرِبِ", author: "رسول الله ﷺ" },
  { text: "الماهر بالقرآن مع السفرة الكرام البررة", author: "رسول الله ﷺ" },
  { text: "اقرؤوا القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه", author: "رسول الله ﷺ" },
  { text: "من قرأ حرفاً من كتاب الله فله به حسنة، والحسنة بعشر أمثالها", author: "رسول الله ﷺ" },
  { text: "إنَّ الله يرفع بهذا الكتاب أقواماً ويضع به آخرين", author: "رسول الله ﷺ" },
];

const SUCCESS_THOUGHTS = [
  { text: "حفظ القرآن ليس سباقاً، بل هو صحبة تدوم للأبد.", author: "إشراقة" },
  { text: "كل صفحة تحفظها اليوم هي حصن لك غداً.", author: "همّة" },
  { text: "صعوبة المراجعة هي دليل على عظم الأجر، فلا تستسلم.", author: "نصيحة" },
  { text: "القرآن لا يقبل شريكاً في القلب، فرغ له قلبك يفتح لك كنوزه.", author: "حكمة" },
];

export default function ReviewScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const [tappedIntention, setTappedIntention] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'akhira' | 'dunya' | 'parent'>('all');
  const [quoteIndex, setQuoteIndex] = useState(0);

  const bounce = useSharedValue(1);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
      true
    );
  }, []);

  const animatedHeart = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }],
  }));

  const filteredVirtues = activeCategory === 'all' 
    ? VIRTUES 
    : VIRTUES.filter(v => v.category === activeCategory);

  const handleRenewIntention = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTappedIntention(true);
    setTimeout(() => setTappedIntention(false), 3000);
  };

  const cycleQuote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuoteIndex((prev) => (prev + 1) % HADITHS.length);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <Animated.View entering={FadeInUp.duration(800)} style={styles.heroSection}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={[styles.heroIconCircle, animatedHeart]}>
              <Ionicons name="star" size={32} color="#FFD700" />
            </Animated.View>
            <Text style={styles.heroTitle}>طريقك إلى النور</Text>
            <Text style={styles.heroSubtitle}>اكتشف كنوز وأجور حفظ كتاب الله لتزداد ثباتاً ويقيناً</Text>
          </LinearGradient>
        </Animated.View>

        {/* Motivational Quote Card */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.quoteCard}>
          <TouchableOpacity activeOpacity={0.9} onPress={cycleQuote} style={styles.quoteInside}>
            <View style={styles.quoteHeader}>
              <Ionicons name="chatbubble-ellipses" size={24} color={Colors.primary} style={{ opacity: 0.2 }} />
              <Text style={styles.quoteBadge}>نفحة نبوية</Text>
            </View>
            <Text style={styles.quoteText}>"{HADITHS[quoteIndex].text}"</Text>
            <View style={styles.quoteFooter}>
              <Text style={styles.quoteAuthor}>{HADITHS[quoteIndex].author}</Text>
              <View style={styles.nextHint}>
                <Text style={styles.nextHintText}>اضغط لحديث آخر</Text>
                <Ionicons name="refresh" size={12} color={Colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Categories Tab */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            <TabItem label="الكل" active={activeCategory === 'all'} onPress={() => setActiveCategory('all')} Colors={Colors} />
            <TabItem label="أجور الآخرة" active={activeCategory === 'akhira'} onPress={() => setActiveCategory('akhira')} Colors={Colors} />
            <TabItem label="بركة الدنيا" active={activeCategory === 'dunya'} onPress={() => setActiveCategory('dunya')} Colors={Colors} />
            <TabItem label="فضل الوالدين" active={activeCategory === 'parent'} onPress={() => setActiveCategory('parent')} Colors={Colors} />
          </ScrollView>
        </View>

        {/* Virtues Grid */}
        <View style={styles.virtueGrid}>
          {filteredVirtues.map((v, i) => (
            <Animated.View 
              key={v.id} 
              entering={FadeInDown.delay(i * 100)} 
              style={styles.vcard}
            >
              <View style={[styles.viconBox, { backgroundColor: `${v.color}15` }]}>
                <Ionicons name={v.icon as any} size={22} color={v.color} />
              </View>
              <Text style={styles.vtitle}>{v.title}</Text>
              <Text style={styles.vdesc}>{v.desc}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Intention Renewal Card */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.intentionCard}>
          <LinearGradient
            colors={tappedIntention ? [Colors.success, Colors.primaryDark] : ["#1F2937", "#111827"]}
            style={styles.intentionGradient}
          >
            <View style={styles.intentionInfo}>
              <Text style={styles.intentionTitle}>
                {tappedIntention ? "نية مباركة!" : "جدد عهدك الآن"}
              </Text>
              <Text style={styles.intentionDesc}>
                {tappedIntention 
                  ? "لقد عقدت العزم مع الله، استعن به ولا تعجز." 
                  : "الإخلاص هو الوقود الذي لا ينطفئ أبداً في رحلة الحفظ."}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.intentionCircle} 
              onPress={handleRenewIntention}
              activeOpacity={0.7}
            >
              <Ionicons name={tappedIntention ? "checkmark" : "sync-outline"} size={24} color="#FFF" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Wisdom Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>خواطر أهل الهمة</Text>
        </View>
        <View style={styles.wisdomContainer}>
          {SUCCESS_THOUGHTS.map((thought, idx) => (
            <Animated.View 
              key={idx} 
              entering={FadeInDown.delay(500 + (idx * 100))}
              style={styles.wisdomCard}
            >
              <View style={styles.wisdomInfo}>
                <Text style={styles.wisdomText}>{thought.text}</Text>
                <Text style={styles.wisdomAuthor}>{thought.author}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const TabItem = ({ label, active, onPress, Colors }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles_tab.tab,
      active && { backgroundColor: Colors.primary },
      !active && { borderColor: Colors.border, borderWidth: 1 }
    ]}
  >
    <Text style={[styles_tab.text, active ? { color: '#FFF' } : { color: Colors.textSecondary }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles_tab = StyleSheet.create({
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  text: { fontSize: 13, fontWeight: 'bold' },
});

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { paddingBottom: 40 },

    heroSection: {
      paddingHorizontal: Spacing.xl,
      paddingTop: 70,
      marginBottom: Spacing.xl,
    },
    heroGradient: {
      padding: Spacing.xl,
      borderRadius: 32,
      alignItems: 'center',
      ...Shadow.lg,
    },
    heroIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFF',
      textAlign: 'center',
    },
    heroSubtitle: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 22,
    },

    quoteCard: {
      marginHorizontal: Spacing.xl,
      backgroundColor: Colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: Colors.border,
      marginBottom: Spacing.xl,
      ...Shadow.sm,
    },
    quoteInside: { padding: Spacing.xl },
    quoteHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    quoteBadge: {
      fontSize: 10,
      fontWeight: 'bold',
      color: Colors.primary,
      backgroundColor: `${Colors.primary}10`,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    quoteText: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.textPrimary,
      textAlign: 'center',
      lineHeight: 28,
      fontStyle: 'italic',
    },
    quoteFooter: {
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    quoteAuthor: { fontSize: 12, fontWeight: 'bold', color: Colors.textSecondary },
    nextHint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    nextHintText: { fontSize: 11, color: Colors.primary, opacity: 0.7 },

    tabsContainer: { marginBottom: Spacing.lg },
    tabsScroll: { paddingHorizontal: Spacing.xl },

    virtueGrid: {
      paddingHorizontal: Spacing.xl,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    vcard: {
      width: (width - Spacing.xl * 2 - 12) / 2,
      backgroundColor: Colors.surface,
      borderRadius: 20,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.borderLight,
      ...Shadow.sm,
    },
    viconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    vtitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: Colors.textPrimary,
      marginBottom: 4,
      textAlign: 'left',
    },
    vdesc: {
      fontSize: 11,
      color: Colors.textSecondary,
      lineHeight: 16,
      textAlign: 'left',
    },

    intentionCard: {
      margin: Spacing.xl,
      borderRadius: 24,
      overflow: 'hidden',
      ...Shadow.md,
    },
    intentionGradient: {
      padding: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    intentionInfo: { flex: 1, marginRight: 16, alignItems: 'flex-start' },
    intentionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
    intentionDesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, textAlign: 'left' },
    intentionCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },

    sectionHeader: { 
      paddingHorizontal: Spacing.xl, 
      marginBottom: Spacing.md, 
      marginTop: Spacing.lg 
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'left' },

    wisdomContainer: { paddingHorizontal: Spacing.xl, gap: 12 },
    wisdomCard: {
      backgroundColor: `${Colors.primary}05`,
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    wisdomInfo: { alignItems: 'flex-start' },
    wisdomText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22, textAlign: 'left' },
    wisdomAuthor: { fontSize: 11, fontWeight: 'bold', color: Colors.primary, marginTop: 4 },
  });
