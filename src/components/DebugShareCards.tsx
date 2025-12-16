import ShareCard from './ShareCard';

const placeholderData = [
  { totalVolume: 225, peakReps: 15, setsCompleted: 29, label: 'Heavyweight (200+)' },
  { totalVolume: 156, peakReps: 12, setsCompleted: 23, label: 'Cruiserweight (150+)' },
  { totalVolume: 100, peakReps: 10, setsCompleted: 19, label: 'Middleweight (100+)' },
  { totalVolume: 64, peakReps: 8, setsCompleted: 15, label: 'Welterweight (50+)' },
  { totalVolume: 25, peakReps: 5, setsCompleted: 9, label: 'Featherweight (<50)' },
];

const DebugShareCards = () => {
  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Share Card Debug</h1>
      <p className="text-neutral-400 mb-8">Cream & Crimson Theme Preview</p>
      
      <div className="flex flex-wrap gap-8">
        {placeholderData.map((data, index) => (
          <div key={index} className="flex flex-col items-center gap-3">
            <ShareCard
              totalVolume={data.totalVolume}
              peakReps={data.peakReps}
              setsCompleted={data.setsCompleted}
              date={new Date()}
            />
            <span className="text-neutral-400 text-sm">{data.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugShareCards;
