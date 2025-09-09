import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 12, borderRadius = 8, style }) => {
  const translateX = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, { toValue: 200, duration: 1200, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -200, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [translateX]);

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View style={[styles.shimmer, { transform: [{ translateX }] }]}> 
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.35)", "transparent"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#E9EEF5',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default Skeleton;

