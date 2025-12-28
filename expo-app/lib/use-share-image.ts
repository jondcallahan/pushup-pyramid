import * as Sharing from "expo-sharing";
import { toPng } from "html-to-image";
import type { RefObject } from "react";
import { useCallback, useState } from "react";
import type { View } from "react-native";
import { Platform } from "react-native";
import { captureRef } from "react-native-view-shot";

type ShareImageOptions = {
  text?: string;
  filename?: string;
};

type ShareResult = "shared" | "copied" | "downloaded" | "cancelled" | "error";

export function useShareImage(ref: RefObject<View | null>) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<ShareResult | null>(null);

  const captureWeb = useCallback(async (): Promise<Blob | null> => {
    // biome-ignore lint/suspicious/noExplicitAny: accessing DOM ref from RN web
    const element = ref.current as any;
    if (!element) return null;

    try {
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error("Error capturing image:", error);
      return null;
    }
  }, [ref]);

  const shareWeb = useCallback(
    async (blob: Blob, options: ShareImageOptions): Promise<ShareResult> => {
      const filename = options.filename ?? `pyramid-push-${Date.now()}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      // Try native share API
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "Pyramid Push Workout",
            text: options.text,
          });
          return "shared";
        } catch (error) {
          if ((error as Error).name === "AbortError") {
            return "cancelled";
          }
          throw error;
        }
      }

      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        return "copied";
      } catch {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        return "downloaded";
      }
    },
    []
  );

  const shareNative = useCallback(async (): Promise<ShareResult> => {
    if (!ref.current) return "error";

    const uri = await captureRef(ref, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share your workout",
      });
      return "shared";
    }

    return "error";
  }, [ref]);

  const share = useCallback(
    async (options: ShareImageOptions = {}): Promise<ShareResult> => {
      setIsGenerating(true);
      setLastResult(null);

      try {
        let result: ShareResult;

        if (Platform.OS === "web") {
          const blob = await captureWeb();
          if (blob) {
            result = await shareWeb(blob, options);
          } else {
            result = "error";
          }
        } else {
          result = await shareNative();
        }

        setLastResult(result);
        return result;
      } catch (error) {
        console.error("Share failed:", error);
        setLastResult("error");
        return "error";
      } finally {
        setIsGenerating(false);
      }
    },
    [captureWeb, shareWeb, shareNative]
  );

  return {
    share,
    isGenerating,
    lastResult,
    showCopied: lastResult === "copied",
  };
}
