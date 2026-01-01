import { useEffect, useRef, useState } from "react";
import Svg, { Circle } from "react-native-svg";

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

  const [smoothProgress, setSmoothProgress] = useState(1);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setSmoothProgress(1);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    if (!(timerStartedAt && timerDuration)) {
      setSmoothProgress(1);
      return;
    }

    const animate = () => {
      const elapsed = Date.now() - timerStartedAt;
      const remaining = Math.max(0, timerDuration - elapsed);
      setSmoothProgress(remaining / timerDuration);
      if (remaining > 0) animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, timerStartedAt, timerDuration]);

  const strokeDashoffset = circumference - smoothProgress * circumference;

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
      <Circle
        cx={size / 2}
        cy={size / 2}
        fill={!isActive ? "transparent" : "#09090b"}
        r={radius}
        stroke={strokeColor}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
