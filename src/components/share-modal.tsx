import { toPng } from "html-to-image";
import { Check, Download, Loader2, Share2, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) {
      return null;
    }

    try {
      // Generate at 2x for retina quality
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      // Convert to blob
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    }
  }, []);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    try {
      if (!cardRef.current) {
        return;
      }

      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `pyramid-push-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImage();
      if (!blob) {
        throw new Error("Failed to generate image");
      }

      const file = new File([blob], "pyramid-push-workout.png", {
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
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          setShowCopied(true);
          setTimeout(() => setShowCopied(false), 2000);
        } catch {
          // If clipboard fails, fallback to download
          handleDownload();
        }
      }
    } catch (error) {
      // User cancelled share or error - ignore AbortError
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed:", error);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [generateImage, totalVolume, handleDownload]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-zinc-800 border-b p-4">
          <h2 className="flex items-center gap-2 font-bold text-lg text-white">
            <Share2 className="text-lime-500" size={20} />
            Share Your Workout
          </h2>
          <button
            className="rounded-full p-2 transition-colors hover:bg-zinc-800"
            onClick={onClose}
            type="button"
          >
            <X className="text-zinc-400" size={20} />
          </button>
        </div>

        {/* Card Preview */}
        <div className="flex justify-center bg-zinc-950/50 p-4">
          <div className="origin-center scale-[0.85] transform overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
            <ShareCard
              date={new Date()}
              peakReps={peakReps}
              ref={cardRef}
              setsCompleted={setsCompleted}
              totalVolume={totalVolume}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 p-4">
          <button
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-lime-500 px-6 py-4 font-bold text-lg text-zinc-950 transition-all hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isGenerating}
            onClick={handleShare}
            type="button"
          >
            {(() => {
              if (isGenerating) {
                return <Loader2 className="animate-spin" size={24} />;
              }
              if (showCopied) {
                return (
                  <>
                    <Check size={24} />
                    Copied to Clipboard!
                  </>
                );
              }
              return (
                <>
                  <Share2 size={24} />
                  Share Image
                </>
              );
            })()}
          </button>

          <button
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-zinc-800 px-6 py-3 font-semibold text-white transition-all hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isGenerating}
            onClick={handleDownload}
            type="button"
          >
            <Download size={20} />
            Save to Device
          </button>
        </div>

        {/* Tip */}
        <div className="px-4 pb-4">
          <p className="text-center text-xs text-zinc-500">
            Share your achievement on Instagram, Twitter, or send to friends!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
