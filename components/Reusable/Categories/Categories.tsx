import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/hooks/useThemeColors";
import SkeletonLoader from "../SkeletonLoader";

const Categories = ({
  setSelectedCategory,
  selectedCategory,
  allCategories,
  bgColor,
  isLoading=false,
}: any) => {
  const colors = useThemeColors();

  return (
    <View style={styles.categoriesContainer}>
      {isLoading ? (
        // 🔹 Skeleton Loader when loading
        <SkeletonLoader width={60} height={26} borderRadius={20} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* "All" category */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory("");
            }}
            style={[
              styles.categoryChip,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
              selectedCategory === "" && {
                backgroundColor: bgColor,
                borderColor: bgColor,
              },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                { color: colors.secondaryText },
                selectedCategory === "" && styles.categoryTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {/* Dynamic categories */}
          {allCategories?.map((category: string) => (
            <TouchableOpacity
              key={category}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCategory(category);
              }}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
                selectedCategory === category && {
                  backgroundColor: bgColor,
                  borderColor: bgColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: colors.secondaryText },
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  categoriesContainer: {
    paddingVertical: 16,
    paddingLeft: 16,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10,
    borderWidth: 1,
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: "#38A169",
    borderColor: "#38A169",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
});
