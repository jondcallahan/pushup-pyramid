import { Composition } from "remotion";
import { AppPreview } from "./AppPreview";
import { OgImage } from "./OgImage";
import { Screenshot } from "./Screenshot";

// iPhone screen sizes for App Store (Apple accepted dimensions)
const IPHONE_67 = { width: 1284, height: 2778 }; // 6.7" display
const IPHONE_65 = { width: 1242, height: 2688 }; // 6.5" display
const IPHONE_55 = { width: 1242, height: 2208 }; // 5.5" (legacy, not required)
const IPAD_129 = { width: 2048, height: 2732 }; // 12.9" iPad Pro
const VIDEO_PREVIEW = { width: 886, height: 1920 }; // App preview video
const OG_IMAGE = { width: 1200, height: 630 }; // Social share image

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

      {/* Screenshots for 12.9" iPad */}
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "idle" as const }}
        durationInFrames={1}
        fps={30}
        height={IPAD_129.height}
        id="Screenshot-iPad-1"
        width={IPAD_129.width}
      />
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "working" as const }}
        durationInFrames={1}
        fps={30}
        height={IPAD_129.height}
        id="Screenshot-iPad-2"
        width={IPAD_129.width}
      />
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "rest" as const }}
        durationInFrames={1}
        fps={30}
        height={IPAD_129.height}
        id="Screenshot-iPad-3"
        width={IPAD_129.width}
      />
      <Composition
        component={Screenshot}
        defaultProps={{ screen: "finished" as const }}
        durationInFrames={1}
        fps={30}
        height={IPAD_129.height}
        id="Screenshot-iPad-4"
        width={IPAD_129.width}
      />

      {/* App Preview Video (30 seconds) */}
      <Composition
        component={AppPreview}
        durationInFrames={900}
        fps={30}
        height={VIDEO_PREVIEW.height}
        id="AppPreview-67"
        width={VIDEO_PREVIEW.width}
      />

      {/* OG Image for social sharing */}
      <Composition
        component={OgImage}
        durationInFrames={1}
        fps={30}
        height={OG_IMAGE.height}
        id="OgImage"
        width={OG_IMAGE.width}
      />
    </>
  );
};
