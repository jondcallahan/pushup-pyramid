import { forwardRef } from 'react';

interface ShareCardProps {
  totalVolume: number;
  peakReps: number;
  setsCompleted: number;
  date: Date;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ totalVolume, peakReps, setsCompleted, date }, ref) => {
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();

    // Rank based on volume
    const getRank = () => {
      if (totalVolume >= 200) return { title: 'HEAVYWEIGHT', stars: 5 };
      if (totalVolume >= 150) return { title: 'CRUISERWEIGHT', stars: 4 };
      if (totalVolume >= 100) return { title: 'MIDDLEWEIGHT', stars: 3 };
      if (totalVolume >= 50) return { title: 'WELTERWEIGHT', stars: 2 };
      return { title: 'FEATHERWEIGHT', stars: 1 };
    };

    const rank = getRank();

    return (
      <div
        ref={ref}
        className="w-[390px] h-[520px] relative overflow-hidden"
        style={{
          background: '#1a1814',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Worn paper texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Diagonal corner cuts */}
        <div 
          className="absolute top-0 right-0 w-20 h-20"
          style={{
            background: 'linear-gradient(135deg, transparent 50%, #c9362c 50%)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-20 h-20"
          style={{
            background: 'linear-gradient(-45deg, transparent 50%, #c9362c 50%)',
          }}
        />

        {/* Main border */}
        <div className="absolute inset-3 border-2 border-[#c9362c]" />
        <div className="absolute inset-4 border border-[#c9362c]/30" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col p-7">
          
          {/* Top banner */}
          <div className="text-center mb-2">
            <div 
              className="inline-block px-6 py-1 bg-[#c9362c] text-[#1a1814] text-[10px] tracking-[0.4em] font-black"
              style={{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}
            >
              OFFICIAL RECORD
            </div>
          </div>

          {/* Date */}
          <div className="text-center text-[#8b8579] text-[10px] tracking-[0.3em] mb-4">
            {formattedDate}
          </div>

          {/* Main title */}
          <div className="text-center mb-1">
            <h1 
              className="text-[#f5f0e8] text-5xl tracking-tight leading-none"
              style={{ 
                fontFamily: 'Impact, Haettenschweiler, sans-serif',
                textShadow: '3px 3px 0 #c9362c',
              }}
            >
              PYRAMID
            </h1>
            <h2 
              className="text-[#c9362c] text-3xl tracking-[0.2em] -mt-1"
              style={{ fontFamily: 'Impact, Haettenschweiler, sans-serif' }}
            >
              PUSH
            </h2>
          </div>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 my-3">
            <div className="h-px w-12 bg-[#c9362c]" />
            <div className="w-2 h-2 rotate-45 border border-[#c9362c]" />
            <div className="h-px w-12 bg-[#c9362c]" />
          </div>

          {/* THE BIG NUMBER */}
          <div className="flex-1 flex flex-col items-center justify-center -mt-2">
            <div className="text-[#8b8579] text-xs tracking-[0.5em] mb-1">TOTAL REPS</div>
            <div className="relative">
              <span 
                className="text-[#f5f0e8] text-[120px] leading-none font-black"
                style={{ 
                  fontFamily: 'Impact, Haettenschweiler, sans-serif',
                  textShadow: '4px 4px 0 #c9362c, 8px 8px 0 rgba(0,0,0,0.3)',
                  letterSpacing: '-0.02em',
                }}
              >
                {totalVolume}
              </span>
            </div>
            
            {/* Rank badge */}
            <div className="mt-2 flex flex-col items-center">
              <div className="flex gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`text-lg ${i < rank.stars ? 'text-[#c9362c]' : 'text-[#3d3a35]'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div 
                className="text-[#f5f0e8] text-sm tracking-[0.3em]"
                style={{ fontFamily: 'Impact, Haettenschweiler, sans-serif' }}
              >
                {rank.title}
              </div>
            </div>
          </div>

          {/* Stats row - fight card style */}
          <div className="border-t border-b border-[#c9362c]/50 py-4 my-2">
            <div className="flex justify-around text-center">
              <div>
                <div 
                  className="text-[#f5f0e8] text-3xl"
                  style={{ fontFamily: 'Impact, Haettenschweiler, sans-serif' }}
                >
                  {peakReps}
                </div>
                <div className="text-[#8b8579] text-[9px] tracking-[0.2em] mt-1">PEAK</div>
              </div>
              <div className="w-px bg-[#c9362c]/30" />
              <div>
                <div 
                  className="text-[#f5f0e8] text-3xl"
                  style={{ fontFamily: 'Impact, Haettenschweiler, sans-serif' }}
                >
                  {setsCompleted}
                </div>
                <div className="text-[#8b8579] text-[9px] tracking-[0.2em] mt-1">SETS</div>
              </div>
              <div className="w-px bg-[#c9362c]/30" />
              <div>
                <div 
                  className="text-[#f5f0e8] text-3xl"
                  style={{ fontFamily: 'Impact, Haettenschweiler, sans-serif' }}
                >
                  {Math.round(totalVolume * 0.36)}
                </div>
                <div className="text-[#8b8579] text-[9px] tracking-[0.2em] mt-1">CALS</div>
              </div>
            </div>
          </div>

          {/* Bottom tagline */}
          <div className="text-center mt-2">
            <div className="text-[#8b8579] text-[10px] tracking-[0.4em]">
              NO EXCUSES • NO SHORTCUTS • NO QUIT
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;
