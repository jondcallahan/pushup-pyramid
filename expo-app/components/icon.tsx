import { SymbolView, type SymbolViewProps } from "expo-symbols";
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  RefreshCw,
  Settings,
  SkipForward,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react-native";
import { Platform } from "react-native";

// Map of icon names to SF Symbol names and Lucide components
const iconMap = {
  "chevron-down": {
    sf: "chevron.down",
    lucide: ChevronDown,
  },
  "chevron-up": {
    sf: "chevron.up",
    lucide: ChevronUp,
  },
  pause: {
    sf: "pause.fill",
    lucide: Pause,
  },
  play: {
    sf: "play.fill",
    lucide: Play,
  },
  refresh: {
    sf: "arrow.counterclockwise",
    lucide: RefreshCw,
  },
  settings: {
    sf: "gearshape.fill",
    lucide: Settings,
  },
  "skip-forward": {
    sf: "forward.fill",
    lucide: SkipForward,
  },
  trophy: {
    sf: "trophy.fill",
    lucide: Trophy,
  },
  "volume-on": {
    sf: "speaker.wave.2.fill",
    lucide: Volume2,
  },
  "volume-off": {
    sf: "speaker.slash.fill",
    lucide: VolumeX,
  },
  x: {
    sf: "xmark",
    lucide: X,
  },
} as const;

export type IconName = keyof typeof iconMap;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  weight?: SymbolViewProps["weight"];
  style?: object;
};

export function Icon({
  name,
  size = 24,
  color = "#ffffff",
  weight = "medium",
  style,
}: IconProps) {
  const icon = iconMap[name];

  if (Platform.OS === "ios") {
    return (
      <SymbolView
        name={icon.sf}
        size={size}
        style={style}
        tintColor={color}
        weight={weight}
      />
    );
  }

  const LucideIcon = icon.lucide;
  return <LucideIcon color={color} size={size} style={style} />;
}
