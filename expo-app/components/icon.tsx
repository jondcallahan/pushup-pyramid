import { SymbolView, type SymbolViewProps } from "expo-symbols";
import {
  ArrowCounterClockwise,
  CaretDown,
  CaretUp,
  Barbell,
  ChartLineUp,
  Pause,
  Play,
  FastForward,
  Gear,
  ShareNetwork,
  SpeakerHigh,
  SpeakerSlash,
  Trophy,
  Waveform,
  X,
} from "phosphor-react-native";
import { Platform } from "react-native";

// Map of icon names to SF Symbol names and Phosphor components
const iconMap = {
  "chevron-down": {
    sf: "chevron.down",
    phosphor: CaretDown,
  },
  "chevron-up": {
    sf: "chevron.up",
    phosphor: CaretUp,
  },
  dumbbell: {
    sf: "dumbbell.fill",
    phosphor: Barbell,
  },
  "chart-up": {
    sf: "chart.line.uptrend.xyaxis",
    phosphor: ChartLineUp,
  },
  waveform: {
    sf: "waveform.path",
    phosphor: Waveform,
  },
  pause: {
    sf: "pause.fill",
    phosphor: Pause,
  },
  play: {
    sf: "play.fill",
    phosphor: Play,
  },
  refresh: {
    sf: "arrow.counterclockwise",
    phosphor: ArrowCounterClockwise,
  },
  settings: {
    sf: "gearshape.fill",
    phosphor: Gear,
  },
  "skip-forward": {
    sf: "forward.fill",
    phosphor: FastForward,
  },
  trophy: {
    sf: "trophy.fill",
    phosphor: Trophy,
  },
  "volume-on": {
    sf: "speaker.wave.2.fill",
    phosphor: SpeakerHigh,
  },
  "volume-off": {
    sf: "speaker.slash.fill",
    phosphor: SpeakerSlash,
  },
  x: {
    sf: "xmark",
    phosphor: X,
  },
  share: {
    sf: "square.and.arrow.up",
    phosphor: ShareNetwork,
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

  const PhosphorIcon = icon.phosphor;
  return <PhosphorIcon color={color} size={size} style={style} weight="bold" />;
}
