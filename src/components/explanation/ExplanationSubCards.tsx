import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typography, Spacing, BorderRadius } from "../../theme";

interface SubCardProps {
  Colors: any;
}

export const PresentationCard: React.FC<SubCardProps> = ({ Colors }) => {
  return (
    <View style={[styles.card, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: Colors.purpleMuted }]}>
          <Ionicons name="play-circle" size={24} color={Colors.purple} />
        </View>
        <Text style={[styles.title, { color: Colors.textPrimary }]}>عرض تقديمي للمنهج</Text>
      </View>
      <Text style={[styles.description, { color: Colors.textSecondary }]}>
        تعتمد خوارزمية التطبيق على تقسيم الحفظ إلى 5 حصون متداخلة تضمن عدم نسيان ما تم حفظه من قبل.
      </Text>
    </View>
  );
};

export const TimeManagementCard: React.FC<SubCardProps> = ({ Colors }) => {
  return (
    <View style={[styles.card, { backgroundColor: Colors.surface, borderColor: Colors.border, marginTop: Spacing.lg }]}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: Colors.blueMuted }]}>
          <Ionicons name="time" size={24} color={Colors.blue} />
        </View>
        <Text style={[styles.title, { color: Colors.textPrimary }]}>إدارة وقت الحفظ</Text>
      </View>
      <View style={styles.timeGrid}>
        <View style={styles.timeItem}>
          <Text style={[styles.timeValue, { color: Colors.primary }]}>45د</Text>
          <Text style={[styles.timeLabel, { color: Colors.textTertiary }]}>حفظ جديد</Text>
        </View>
        <View style={styles.timeItem}>
          <Text style={[styles.timeValue, { color: Colors.gold }]}>30د</Text>
          <Text style={[styles.timeLabel, { color: Colors.textTertiary }]}>مراجعة</Text>
        </View>
        <View style={styles.timeItem}>
          <Text style={[styles.timeValue, { color: Colors.purple }]}>15د</Text>
          <Text style={[styles.timeLabel, { color: Colors.textTertiary }]}>تحضير</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.md,
    fontWeight: "bold",
  },
  description: {
    fontFamily: Typography.body,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  timeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  timeItem: {
    alignItems: "center",
    flex: 1,
  },
  timeValue: {
    fontFamily: Typography.heading,
    fontSize: Typography.lg,
    fontWeight: "bold",
  },
  timeLabel: {
    fontFamily: Typography.body,
    fontSize: Typography.xs,
    marginTop: 2,
  },
});
