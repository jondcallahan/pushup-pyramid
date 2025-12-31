import { Composition } from "remotion";
import { Screenshot } from "./Screenshot";
import { AppPreview } from "./AppPreview";

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
        id="Screenshot-67-1"
        component={Screenshot}
        durationInFrames={1}
        fps={30}
        width={IPHONE_67.width}
        height={IPHONE_67.height}
        defaultProps={{ screen: "idle" as const }}
      />
      <Composition
        id="Screenshot-67-2"
        component={Screenshot}
        durationInFrames={1}
        fps={30}
        width={IPHONE_67.width}
        height={IPHONE_67.height}
        defaultProps={{ screen: "working" as const }}
      />
      <Composition
        id="Screenshot-67-3"
        component={Screenshot}
        durationInFrames={1}
        fps={30}
        width={IPHONE_67.width}
        height={IPHONE_67.height}
        defaultProps={{ screen: "rest" as const }}
      />
      <Composition
        id="Screenshot-67-4"
        component={Screenshot}
        durationInFrames={1}
        fps={30}
        width={IPHONE_67.width}
        height={IPHONE_67.height}
        defaultProps={{ screen: "finished" as const }}
      />

      {/* Screenshots for 6.5" iPhone */}
      <Composition
        id="Screenshot-65-1"
        component={Screenshot}
        durationInFrames={1}
        fps={30}
        width={IPHONE_65.width}
        height={IPHONE_65.height}
        defaultProps={{ screen: "idle" as const }}
      />
      <Composition
        id="Screenshot-65-2"
        component={Screenshot}
        durationInFrames={1}
        fps={30}
        width={IPHONE_65.width}
        height={IPHONE_65.height}
        defaultProps={{ screen: "working" as const }}
      />
      <Composition
        id="Screenshot-65-3"
        component={Screenshot}
        durationInFrames={1}
        fps={30}
        width={IPHONE_65.width}
        height={IPHONE_65.height}
        defaultProps={{ screen: "rest" as const }}
      />
      <Composition
        id="Screenshot-65-4"
        component={Screenshot}
        durationInFrames={1}
        fps={30}
        width={IPHONE_65.width}
        height={IPHONE_65.height}
        defaultProps={{ screen: "finished" as const }}
      />

      {/* Screenshots for 5.5" iPhone */}
      <Composition
        id="Screenshot-55-1"
        component={Screenshot}
        durationInFrames={1}
        fps={30}
        width={IPHONE_55.width}
        height={IPHONE_55.height}
        defaultProps={{ screen: "idle" as const }}
      />
      <Composition
        id="Screenshot-55-2"
        component={Screenshot}
        durationInFrames={1}
        fps={30}
        width={IPHONE_55.width}
        height={IPHONE_55.height}
        defaultProps={{ screen: "working" as const }}
      />
      <Composition
        id="Screenshot-55-3"
        component={Screenshot}
        durationInFrames={1}
        fps={30}
        width={IPHONE_55.width}
        height={IPHONE_55.height}
        defaultProps={{ screen: "rest" as const }}
      />
      <Composition
        id="Screenshot-55-4"
        component={Screenshot}
        durationInFrames={1}
        fps={30}
        width={IPHONE_55.width}
        height={IPHONE_55.height}
        defaultProps={{ screen: "finished" as const }}
      />

      {/* App Preview Video (30 seconds) */}
      <Composition
        id="AppPreview-67"
        component={AppPreview}
        durationInFrames={900}
        fps={30}
        width={IPHONE_67.width}
        height={IPHONE_67.height}
      />
    </>
  );
};
