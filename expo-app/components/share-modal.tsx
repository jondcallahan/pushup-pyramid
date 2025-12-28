import { useRef } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { useShareImage } from "../lib/use-share-image";
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
  const { share, isGenerating, showCopied } = useShareImage(cardRef);

  const handleShare = async () => {
    const result = await share({
      text: `Just crushed ${totalVolume} push-ups! 💪🔥`,
    });

    // Close modal after native share completes
    if (Platform.OS !== "web" && result === "shared") {
      onClose();
    }
  };

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
