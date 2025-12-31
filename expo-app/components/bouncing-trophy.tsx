import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Icon } from "./icon";

export function BouncingTrophy() {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withRepeat(
          withSequence(
            withTiming(-10, { duration: 400 }),
            withTiming(0, { duration: 400 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon color="#facc15" name="trophy" size={64} />
    </Animated.View>
  );
}
