import { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { X, Download, Share2, Check, Loader2 } from 'lucide-react';
import ShareCard from './ShareCard';

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
      console.error('Error generating image:', error);
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

      const link = document.createElement('a');
      link.download = `pyramid-push-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    setIsGenerating(true);
    try {
      const blob = await generateImage();
      if (!blob) {
        throw new Error('Failed to generate image');
      }

      const file = new File([blob], 'pyramid-push-workout.png', {
        type: 'image/png',
      });

      // Check if native share is available and supports files
      if (
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: 'Pyramid Push Workout',
          text: `Just crushed ${totalVolume} push-ups! 💪🔥`,
        });
      } else {
        // Fallback: copy image to clipboard
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
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
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [generateImage, totalVolume, handleDownload]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#990000]/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDD0] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-2 border-[#DC143C]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-[#DC143C]/30 bg-[#FFF8DC]">
          <h2 className="text-lg font-bold text-[#990000] flex items-center gap-2">
            <Share2 size={20} className="text-[#DC143C]" />
            Share Your Workout
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#DC143C]/10 rounded-full transition-colors"
          >
            <X size={20} className="text-[#990000]" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-4 flex justify-center bg-[#FAF0DC]">
          <div className="rounded-2xl overflow-hidden shadow-2xl ring-2 ring-[#DC143C]/20 transform scale-[0.85] origin-center">
            <ShareCard
              ref={cardRef}
              totalVolume={totalVolume}
              peakReps={peakReps}
              setsCompleted={setsCompleted}
              date={new Date()}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-3 bg-[#FFFDD0]">
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="w-full py-4 px-6 bg-[#DC143C] hover:bg-[#990000] text-[#FFFDD0] rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            {isGenerating ? (
              <Loader2 size={24} className="animate-spin" />
            ) : showCopied ? (
              <>
                <Check size={24} />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Share2 size={24} />
                Share Image
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full py-3 px-6 bg-[#FFF8DC] hover:bg-[#F5E6C8] text-[#990000] border-2 border-[#DC143C]/40 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            Save to Device
          </button>
        </div>

        {/* Tip */}
        <div className="px-4 pb-4 bg-[#FFFDD0]">
          <p className="text-xs text-[#990000]/70 text-center">
            Share your achievement on Instagram, Twitter, or send to friends!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
