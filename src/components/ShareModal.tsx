import { toPng } from "html-to-image";
import { Check, Download, Loader2, Share2, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ShareCard from "./ShareCard";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalVolume: number;
  peakReps: number;
  setsCompleted: number;
}

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
    if (!cardRef.current) return null;

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
      if (!cardRef.current) return;

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: `
          radial-gradient(ellipse at center, rgba(92,64,51,0.95) 0%, rgba(40,28,22,0.98) 100%)
        `,
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
      `}</style>

      <div
        className="relative w-full max-w-md overflow-hidden"
        style={{
          background:
            "linear-gradient(175deg, #F5E6D3 0%, #E8D4BC 50%, #DCC5A5 100%)",
          borderRadius: "4px",
          boxShadow: `
            0 0 0 3px #8B0000,
            0 0 0 6px #F5E6D3,
            0 0 0 8px #5C4033,
            0 25px 50px rgba(0,0,0,0.5)
          `,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            background: "linear-gradient(180deg, #8B0000 0%, #660000 100%)",
            borderBottom: "3px solid #5C4033",
          }}
        >
          <h2
            className="flex items-center gap-3"
            style={{
              fontFamily: '"Libre Baskerville", Georgia, serif',
              fontSize: "16px",
              color: "#F5E6D3",
              letterSpacing: "0.05em",
            }}
          >
            <Share2 size={18} style={{ color: "#D4B896" }} />
            Share Your Victory
          </h2>
          <button
            className="rounded-full p-2 transition-all hover:scale-110"
            onClick={onClose}
            style={{
              background: "rgba(0,0,0,0.2)",
              color: "#F5E6D3",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Card Preview */}
        <div
          className="flex justify-center p-6"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 19px,
                rgba(139,0,0,0.03) 19px,
                rgba(139,0,0,0.03) 20px
              )
            `,
          }}
        >
          <div
            className="origin-center scale-[0.82] transform overflow-hidden rounded"
            style={{
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
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
        <div
          className="space-y-3 p-5"
          style={{ background: "rgba(139,0,0,0.03)" }}
        >
          <button
            className="flex w-full items-center justify-center gap-3 rounded px-6 py-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isGenerating}
            onClick={handleShare}
            style={{
              background: "linear-gradient(180deg, #8B0000 0%, #660000 100%)",
              color: "#F5E6D3",
              fontFamily: '"Libre Baskerville", Georgia, serif',
              fontSize: "15px",
              fontWeight: "bold",
              letterSpacing: "0.1em",
              boxShadow:
                "0 4px 12px rgba(139,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
              border: "2px solid #5C4033",
            }}
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={22} />
            ) : showCopied ? (
              <>
                <Check size={22} />
                COPIED TO CLIPBOARD
              </>
            ) : (
              <>
                <Share2 size={22} />
                SHARE CERTIFICATE
              </>
            )}
          </button>

          <button
            className="flex w-full items-center justify-center gap-3 rounded px-6 py-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isGenerating}
            onClick={handleDownload}
            style={{
              background: "transparent",
              color: "#5C4033",
              fontFamily: '"Libre Baskerville", Georgia, serif',
              fontSize: "14px",
              fontWeight: "bold",
              letterSpacing: "0.1em",
              border: "2px solid #8B0000",
            }}
          >
            <Download size={18} />
            SAVE TO DEVICE
          </button>
        </div>

        {/* Tip */}
        <div
          className="px-5 pb-5 text-center"
          style={{ background: "rgba(139,0,0,0.03)" }}
        >
          <p
            style={{
              fontFamily: '"Libre Baskerville", Georgia, serif',
              fontStyle: "italic",
              fontSize: "11px",
              color: "#5C4033",
              opacity: 0.7,
            }}
          >
            Spread the word — inspire others to join the grind
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
