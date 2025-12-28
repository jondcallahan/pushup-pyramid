import * as Sharing from "expo-sharing";
import { toPng } from "html-to-image";
import { useCallback, useRef, useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import { Icon } from "./icon";
import ShareCard from "./share-card";

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  totalVolume: number;
  peakReps: number;
  setsCompleted: number;
};

const ShareModal = ({
  isOpen,
  onClose,
  totalVolume,
  peakReps,
  setsCompleted,
}: ShareModalProps) => {
  const cardRef = useRef<View>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  // Web: Generate image using html-to-image
  const generateImageWeb = useCallback(async (): Promise<Blob | null> => {
    // biome-ignore lint/suspicious/noExplicitAny: accessing DOM ref from RN web
    const element = cardRef.current as any;
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
      console.error("Error generating image:", error);
      return null;
    }
  }, []);

  const handleShare = useCallback(async () => {
    setIsGenerating(true);

    try {
      if (Platform.OS === "web") {
        const blob = await generateImageWeb();
        if (!blob) {
          throw new Error("Failed to generate image");
        }

        const file = new File([blob], `pyramid-push-${Date.now()}.png`, {
          type: "image/png",
        });

        // Check if native share is available and supports files
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Pyramid Push Workout",
            text: `Just crushed ${totalVolume} push-ups! 💪🔥`,
          });
        } else {
          // Fallback: copy image to clipboard
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
          } catch {
            // If clipboard fails, download
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `pyramid-push-${Date.now()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
          }
        }
      } else {
        // Native: Use react-native-view-shot
        if (!cardRef.current) return;

        const uri = await captureRef(cardRef, {
          format: "png",
          quality: 1,
          result: "tmpfile",
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share your workout",
          });
        }
        // Close modal after native share completes
        onClose();
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [totalVolume, generateImageWeb, onClose]);

  return (
    <Modal
      animationType={Platform.OS === "web" ? "fade" : "slide"}
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible={isOpen}
    >
      <View className="flex-1 bg-zinc-900">
        {/* Header */}
        <View className="flex-row items-center justify-between border-zinc-800 border-b p-4">
          <Text className="font-bold text-lg text-white">
            Share Your Workout
          </Text>
          <Pressable onPress={onClose}>
            <Text className="font-semibold text-lime-500">Done</Text>
          </Pressable>
        </View>

        {/* Card Preview */}
        <View className="flex-1 items-center justify-center">
          <View
            style={{
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              transform: [{ scale: 0.7 }],
            }}
          >
            <ShareCard
              date={new Date()}
              peakReps={peakReps}
              ref={cardRef}
              setsCompleted={setsCompleted}
              totalVolume={totalVolume}
            />
          </View>
        </View>

        {/* Actions */}
        <View className="p-4 pb-8">
          <Pressable
            className="flex-row items-center justify-center gap-3 rounded-xl bg-lime-500 px-6 py-4 active:bg-lime-400 disabled:opacity-70"
            disabled={isGenerating}
            onPress={handleShare}
          >
            {showCopied ? (
              <Text className="font-bold text-lg text-zinc-950">
                ✓ Copied to Clipboard!
              </Text>
            ) : isGenerating ? (
              <Text className="font-bold text-lg text-zinc-950">
                Generating...
              </Text>
            ) : (
              <>
                <Icon color="#09090b" name="share" size={24} />
                <Text className="font-bold text-lg text-zinc-950">
                  Share Image
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ShareModal;
