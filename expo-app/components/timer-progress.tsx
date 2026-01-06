import { useEffect, useRef } from "react";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerProgressProps {
  size: number;
  strokeWidth: number;
  strokeColor: string;
  timerStartedAt: number;
  timerDuration: number;
  isActive: boolean;
}

export function TimerProgress({
  size,
  strokeWidth,
  strokeColor,
  timerStartedAt,
  timerDuration,
  isActive,
}: TimerProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const progress = useSharedValue(1);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (progress.value !== 1) {
        progress.value = withTiming(1, { duration: 200 });
      }
      return;
    }

    if (!(timerStartedAt && timerDuration)) {
      progress.value = 1;
      return;
    }

    progress.value = 1;

    const animate = () => {
      const elapsed = Date.now() - timerStartedAt;
      const remaining = Math.max(0, timerDuration - elapsed);
      const newProgress = remaining / timerDuration;

      progress.value = newProgress;

      if (remaining > 0) animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, timerStartedAt, timerDuration]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - progress.value * circumference,
  }));

  return (
    <Svg
      height={size}
      style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      width={size}
    >
      <Circle
        cx={size / 2}
        cy={size / 2}
        fill="transparent"
        r={radius}
        stroke="#18181b"
        strokeWidth={strokeWidth}
      />
      <AnimatedCircle
        animatedProps={animatedProps}
        cx={size / 2}
        cy={size / 2}
        fill={isActive ? "#09090b" : "transparent"}
        r={radius}
        stroke={strokeColor}
        strokeDasharray={circumference}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
