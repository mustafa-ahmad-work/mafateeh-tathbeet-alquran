import React from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typography, Spacing, BorderRadius } from "../../theme";

interface DeveloperCardProps {
  Colors: any;
}

export const DeveloperCard: React.FC<DeveloperCardProps> = ({ Colors }) => {
  return (
    <View style={[styles.container, { backgroundColor: Colors.surfaceElevated, borderColor: Colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: Colors.primarySubtle }]}>
        <Ionicons name="person" size={30} color={Colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: Colors.textPrimary }]}>تطوير وإعداد</Text>
        <Text style={[styles.desc, { color: Colors.textSecondary }]}>
          تم تطوير هذا التطبيق لخدمة حفظة كتاب الله تعالى، نسألكم الدعاء بظهر الغيب.
        </Text>
        <View style={styles.socials}>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: Colors.glass }]}>
            <Ionicons name="logo-github" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: Colors.glass }]}>
            <Ionicons name="mail" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: Typography.heading,
    fontSize: Typography.base,
    fontWeight: "bold",
    marginBottom: 4,
  },
  desc: {
    fontFamily: Typography.body,
    fontSize: Typography.xs,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  socials: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  socialBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
});
