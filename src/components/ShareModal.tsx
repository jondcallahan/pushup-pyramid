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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 size={20} className="text-[#c9362c]" />
            Share Your Workout
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-4 flex justify-center bg-slate-950/50">
          <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 transform scale-[0.85] origin-center">
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
        <div className="p-4 space-y-3">
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="w-full py-4 px-6 bg-[#c9362c] hover:bg-[#a82d25] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
            className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            Save to Device
          </button>
        </div>

        {/* Tip */}
        <div className="px-4 pb-4">
          <p className="text-xs text-slate-500 text-center">
            Share your achievement on Instagram, Twitter, or send to friends!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
