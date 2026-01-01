import { Composition } from "remotion";
import { AppPreview } from "./AppPreview";
import { Screenshot } from "./Screenshot";

// iPhone screen sizes for App Store
const IPHONE_67 = { width: 1290, height: 2796 }; // 6.7" (iPhone 15 Pro Max)
const IPHONE_65 = { width: 1284, height: 2778 }; // 6.5" (iPhone 11 Pro Max)
const IPHONE_55 = { width: 1242, height: 2208 }; // 5.5" (iPhone 8 Plus)
const IPAD_129 = { width: 2048, height: 2732 }; // 12.9" iPad Pro

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Screenshots for 6.7" iPhone */}
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "idle" as const }}
        durationInFrames={1}
        fps={30}
        height={IPHONE_67.height}
        id="Screenshot-67-1"
        width={IPHONE_67.width}
      />
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "working" as const }}
        durationInFrames={1}
        fps={30}
        height={IPHONE_67.height}
        id="Screenshot-67-2"
        width={IPHONE_67.width}
      />
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "rest" as const }}
        durationInFrames={1}
        fps={30}
        height={IPHONE_67.height}
        id="Screenshot-67-3"
        width={IPHONE_67.width}
      />
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "finished" as const }}
        durationInFrames={1}
        fps={30}
        height={IPHONE_67.height}
        id="Screenshot-67-4"
        width={IPHONE_67.width}
      />

      {/* Screenshots for 6.5" iPhone */}
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "idle" as const }}
        durationInFrames={1}
        fps={30}
        height={IPHONE_65.height}
        id="Screenshot-65-1"
        width={IPHONE_65.width}
      />
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "working" as const }}
        durationInFrames={1}
        fps={30}
        height={IPHONE_65.height}
        id="Screenshot-65-2"
        width={IPHONE_65.width}
      />
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "rest" as const }}
        durationInFrames={1}
        fps={30}
        height={IPHONE_65.height}
        id="Screenshot-65-3"
        width={IPHONE_65.width}
      />
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "finished" as const }}
        durationInFrames={1}
        fps={30}
        height={IPHONE_65.height}
        id="Screenshot-65-4"
        width={IPHONE_65.width}
      />

      {/* Screenshots for 5.5" iPhone */}
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "idle" as const }}
        durationInFrames={1}
        fps={30}
        height={IPHONE_55.height}
        id="Screenshot-55-1"
        width={IPHONE_55.width}
      />
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "working" as const }}
        durationInFrames={1}
        fps={30}
        height={IPHONE_55.height}
        id="Screenshot-55-2"
        width={IPHONE_55.width}
      />
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "rest" as const }}
        durationInFrames={1}
        fps={30}
        height={IPHONE_55.height}
        id="Screenshot-55-3"
        width={IPHONE_55.width}
      />
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "finished" as const }}
        durationInFrames={1}
        fps={30}
        height={IPHONE_55.height}
        id="Screenshot-55-4"
        width={IPHONE_55.width}
      />

      {/* App Preview Video (30 seconds) */}
      <Composition
        component={AppPreview}
        durationInFrames={900}
        fps={30}
        height={IPHONE_67.height}
        id="AppPreview-67"
        width={IPHONE_67.width}
      />
    </>
  );
};
