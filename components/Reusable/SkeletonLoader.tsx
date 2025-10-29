import { useThemeColors } from "@/hooks/useThemeColors";
import { JSX, useEffect, useRef } from "react";
import { Animated, View } from "react-native";

type SkeletonLoaderProps = {
  width: any;
  height: number;
  innerSkeleton?: JSX.Element; 
  borderRadius?: number;
  direction?: "row" | "column";
  array?:number[]

};

const SkeletonLoader = ({ width, height, innerSkeleton,borderRadius=16, direction="row",array=[1,2,3] }: SkeletonLoaderProps) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;
  const colors =useThemeColors()

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerValue]);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={{ flexDirection: direction, gap: 15 }}>
      {array.map((_, i) => (
        <Animated.View
          key={i}
          style={{
            width,
            height,
            borderRadius,
            backgroundColor: colors.card,
            opacity,
            overflow: "hidden",
          }}
        >
          {innerSkeleton}
        </Animated.View>
      ))}
    </View>
  );
};

export default SkeletonLoader;
