import { useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "./icon";
import { useAppStore } from "../lib/store";

interface OnboardingProps {
  onComplete: () => void;
}

interface SlideData {
  title: string;
  subtitle: string;
  icon: IconName;
  description: string;
  highlight?: string;
  quote?: {
    text: string;
    author: string;
  };
}

const slides: SlideData[] = [
  {
    title: "DO 100",
    subtitle: "PUSH-UPS",
    icon: "dumbbell",
    description: "Not someday. Today. The pyramid builds you up one rep at a time.",
    highlight: "One workout. Zero excuses.",
  },
  {
    title: "REST",
    subtitle: "SMARTER",
    icon: "chart-up",
    description: "Short breaks when it's easy. Longer when it's hard. You're always ready for the next set.",
    highlight: "1 - 2 - 3 - Peak - 3 - 2 - 1",
  },
  {
    title: "JUST",
    subtitle: "LISTEN",
    icon: "waveform",
    description: "Audio cues for every rep. Get in position, close your eyes, and go.",
    highlight: "We count. You push.",
  },
  {
    title: "IT",
    subtitle: "WORKS",
    icon: "trophy",
    description: "We didn't invent the pyramid. We just made it impossible to mess up.",
    highlight: "Proven for 70+ years.",
    quote: {
      text: "There are no shortcuts—everything is reps, reps, reps.",
      author: "Arnold Schwarzenegger",
    },
  },
];

function Slide({ data, width }: { data: SlideData; width: number }) {
  return (
    <View 
      className="flex-1 items-center justify-center px-8" 
      style={{ width }}
    >
      <View className="items-center">
        <View className="mb-6">
          <Icon name={data.icon} size={72} color="#a3e635" />
        </View>
        <Text className="font-black text-5xl text-white tracking-tight">
          {data.title}
        </Text>
        <Text className="font-black text-5xl text-lime-400 tracking-tight">
          {data.subtitle}
        </Text>
        <Text className="mt-6 max-w-xs text-center text-lg text-zinc-400">
          {data.description}
        </Text>
        {data.highlight && (
          <View className="mt-4 rounded-full bg-zinc-800 px-4 py-2">
            <Text className="font-mono text-sm text-lime-400">
              {data.highlight}
            </Text>
          </View>
        )}
        {data.quote && (
          <View className="mt-6 max-w-xs">
            <Text className="text-center text-base italic text-zinc-500">
              "{data.quote.text}"
            </Text>
            <Text className="mt-2 text-center text-sm font-semibold text-zinc-600">
              — {data.quote.author}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(active ? 24 : 8, { damping: 15, stiffness: 120 }),
    opacity: withSpring(active ? 1 : 0.4, { damping: 15, stiffness: 120 }),
  }));

  return (
    <Animated.View
      className="h-2 rounded-full bg-lime-400"
      style={animatedStyle}
    />
  );
}

function PyramidBar({ height, active }: { height: number; active: boolean }) {
  const maxHeight = 60;
  const targetHeight = active ? (height / 5) * maxHeight : 12;

  const animatedStyle = useAnimatedStyle(() => ({
    height: withSpring(targetHeight, { 
      damping: 8, 
      stiffness: 100,
      mass: 0.5,
    }),
    opacity: withSpring(active ? 1 : 0.3, { damping: 15, stiffness: 120 }),
  }));

  return (
    <Animated.View
      className="w-5 rounded-t bg-lime-400"
      style={animatedStyle}
    />
  );
}

function PyramidVisual({ slideIndex }: { slideIndex: number }) {
  const bars = [1, 2, 3, 4, 5, 4, 3, 2, 1];
  const active = slideIndex % 2 === 1; // Bounce up on slides 1 and 3

  return (
    <View className="h-16 w-56 flex-row items-end justify-center gap-1">
      {bars.map((height, idx) => (
        <PyramidBar key={idx} height={height} active={active} />
      ))}
    </View>
  );
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);


  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== activeIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      const nextIndex = activeIndex + 1;
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    useAppStore.setState({ hasSeenOnboarding: true });
    onComplete();
  };

  const isLastSlide = activeIndex === slides.length - 1;

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Skip button */}
      <View
        className="absolute right-4 z-10"
        style={{ top: insets.top + 16 }}
      >
        <Pressable
          className="rounded-full px-4 py-2"
          onPress={handleSkip}
        >
          <Text className="font-medium text-zinc-500">Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {slides.map((slide, index) => (
          <Slide key={index} data={slide} width={width} />
        ))}
      </ScrollView>

      {/* Pyramid visual */}
      <View className="items-center pb-6">
        <PyramidVisual slideIndex={activeIndex} />
      </View>

      {/* Bottom controls */}
      <View
        className="items-center gap-6 px-8"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Dots */}
        <View className="flex-row gap-2">
          {slides.map((_, idx) => (
            <Dot key={idx} active={idx === activeIndex} />
          ))}
        </View>

        <Pressable
          className={`w-full max-w-sm items-center rounded-full py-4 ${
            isLastSlide ? "bg-lime-500" : "bg-zinc-800"
          }`}
          onPress={handleNext}
        >
          <Text
            className={`font-bold text-lg ${
              isLastSlide ? "text-zinc-900" : "text-white"
            }`}
          >
            {isLastSlide ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
