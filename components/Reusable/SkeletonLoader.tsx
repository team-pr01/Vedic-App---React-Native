import { JSX, useEffect, useRef } from "react";
import { Animated, View } from "react-native";

type SkeletonLoaderProps = {
  width: number;
  height: number;
  innerSkeleton?: JSX.Element; 
  borderRadius?: number;
};

const SkeletonLoader = ({ width, height, innerSkeleton,borderRadius=16 }: SkeletonLoaderProps) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

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
    <View style={{ flexDirection: "row", gap: 15 }}>
      {[1, 2, 3].map((_, i) => (
        <Animated.View
          key={i}
          style={{
            width,
            height,
            borderRadius,
            backgroundColor: "#e0e0e0",
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
