import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Star, Swords, ChevronRight, X } from 'lucide-react';
import { TopBar } from '../../components/ui/TopBar';
import { usePlayerStore } from '../../store/playerStore';
import { FishTablesGame } from './FishTablesGame';
import type { AdventureRegion, AdventureStage } from '../../types';

const REGIONS: AdventureRegion[] = [
  {
    id: 'river-district',
    name: 'The River District',
    flavor: 'A gritty waterfront where fish abound',
    status: 'available',
    stages: [
      { id: 1, name: 'Fish Tables',      stars: 0, completed: false },
      { id: 2, name: 'The Micro Grind',  stars: 0, completed: false },
      { id: 3, name: 'Reg Battles',      stars: 0, completed: false },
      { id: 4, name: 'Loose Cannons',    stars: 0, completed: false },
      { id: 5, name: 'The Whale Hunter', stars: 0, completed: false },
      { id: 6, name: 'Boss: River King', stars: 0, completed: false, isBoss: true },
    ],
  },
  {
    id: 'silver-felt',
    name: 'Silver Felt Casino',
    flavor: 'Mid-stakes grinders defend their tables',
    status: 'locked',
    stages: [
      { id: 1, name: 'Early Grind',       stars: 0, completed: false },
      { id: 2, name: 'The 3-Bet Lab',     stars: 0, completed: false },
      { id: 3, name: 'Squeeze Masters',   stars: 0, completed: false },
      { id: 4, name: 'Cold Call Trap',    stars: 0, completed: false },
      { id: 5, name: "The Grinder's Den", stars: 0, completed: false },
      { id: 6, name: 'Boss: The Professor', stars: 0, completed: false, isBoss: true },
    ],
    rewardSkinId: 'shadow',
  },
  {
    id: 'high-roller-vault',
    name: 'High Roller Vault',
    flavor: 'Only the elite dare enter',
    status: 'locked',
    stages: [
      { id: 1, name: '???',      stars: 0, completed: false },
      { id: 2, name: '???',      stars: 0, completed: false },
      { id: 3, name: '???',      stars: 0, completed: false },
      { id: 4, name: '???',      stars: 0, completed: false },
      { id: 5, name: '???',      stars: 0, completed: false },
      { id: 6, name: 'Boss: ???', stars: 0, completed: false, isBoss: true },
    ],
    rewardSkinId: 'flames',
  },
];

const AI_PERSONAS = [
  { name: 'River King',    style: 'Aggressive', avatar: '😤', tagline: 'I never fold to pressure.' },
  { name: 'The Professor', style: 'Balanced',   avatar: '🎓', tagline: 'Every bet tells a story.' },
  { name: 'Silent Sam',    style: 'Passive',    avatar: '😶', tagline: 'I play the long game.' },
];

interface StageModalProps {
  region: AdventureRegion;
  stage: AdventureStage;
  stageProgress: { completed: boolean; stars: number } | undefined;
  onClose: () => void;
  onPlay: () => void;
}

function StageModal({ region, stage, stageProgress, onClose, onPlay }: StageModalProps) {
  const isFishTables = region.id === 'river-district' && stage.id === 1;
  const persona = isFishTables
    ? { name: 'Calling Carl', style: 'Calling Station', avatar: '🐟', tagline: 'I always find a reason to call.' }
    : AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)];

  const bestStars = stageProgress?.stars ?? stage.stars;
  const alreadyCompleted = stageProgress?.completed ?? stage.completed;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto overflow-hidden"
        style={{
          background: 'var(--panel)',
          border: '3px solid var(--panel-border)',
          borderRadius: 8,
          boxShadow: '4px 4px 0 rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="p-4" style={{ borderBottom: '3px solid rgba(0,0,0,0.5)' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-pixel text-[9px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,245,214,0.4)' }}>
                {region.name}
              </p>
              <h3 className="font-pixel text-xl" style={{ color: '#fff5d6' }}>{stage.name}</h3>
              {alreadyCompleted && (
                <div className="flex items-center gap-1 mt-1.5">
                  {[1, 2, 3].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5"
                      style={{ color: s <= bestStars ? '#ffb700' : 'rgba(255,183,0,0.2)', fill: s <= bestStars ? '#ffb700' : 'none' }} />
                  ))}
                  <span className="font-pixel text-[9px] ml-1" style={{ color: 'rgba(255,245,214,0.4)' }}>Best</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="btn-balatro btn-dark w-8 h-8 flex items-center justify-center cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" style={{ color: '#fff5d6' }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3">
          {/* Opponent */}
          <p className="font-pixel text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,245,214,0.4)' }}>
            Your Opponent
          </p>
          <div className="flex items-center gap-3 p-3"
            style={{ background: '#1f1208', border: '2px solid #7a4f2a', borderRadius: 6, boxShadow: '3px 3px 0 #3a2010' }}>
            <div className="w-12 h-12 flex items-center justify-center text-3xl shrink-0"
              style={{ background: '#160d05', border: '2px solid #7a4f2a', borderRadius: 6 }}>
              {persona.avatar}
            </div>
            <div>
              <p className="font-pixel text-sm" style={{ color: '#fff5d6' }}>{persona.name}</p>
              <p className="font-pixel text-[10px]" style={{ color: 'rgba(255,245,214,0.4)' }}>
                Style: <span style={{ color: '#ffb700' }}>{persona.style}</span>
              </p>
              <p className="font-pixel text-[9px] italic" style={{ color: 'rgba(255,245,214,0.35)' }}>
                "{persona.tagline}"
              </p>
            </div>
          </div>

          {/* Region reward */}
          {region.rewardSkinId && !alreadyCompleted && (
            <div className="flex items-center gap-3 p-3"
              style={{ background: '#1a0f00', border: '2px solid #b88a00', borderRadius: 6, boxShadow: '3px 3px 0 #8a6000' }}>
              <span className="text-xl">🎴</span>
              <div>
                <p className="font-pixel text-[9px] uppercase tracking-widest" style={{ color: '#ffb700' }}>Region Reward</p>
                <p className="font-pixel text-[10px]" style={{ color: '#fff5d6' }}>
                  {region.rewardSkinId === 'shadow' ? 'Shadow Veil' : 'Inferno'} card skin
                </p>
              </div>
            </div>
          )}

          {/* Stage objective (Fish Tables) */}
          {isFishTables && (
            <div className="flex items-start gap-3 p-3"
              style={{ background: '#0f2a18', border: '2px solid #1d5c2a', borderRadius: 6, boxShadow: '3px 3px 0 #0a1a0f' }}>
              <span className="text-lg mt-0.5">🎯</span>
              <div>
                <p className="font-pixel text-[9px] uppercase tracking-widest mb-0.5" style={{ color: '#3a8a4a' }}>
                  Stage Objective
                </p>
                <p className="font-pixel text-[10px]" style={{ color: 'rgba(255,245,214,0.5)' }}>
                  Play 3 GTO hands against loose fish. Exploit their calling tendencies with thin value bets.
                </p>
              </div>
            </div>
          )}

          <button
            className="btn-balatro btn-green w-full py-3 cursor-pointer"
            onClick={onPlay}
          >
            {alreadyCompleted ? '🔄 Replay Stage' : stage.isBoss ? '⚔️ Challenge Boss' : '▶ Start Stage'}
          </button>
        </div>
      </motion.div>
    </>
  );
}

type ActiveGame = 'fish-tables' | null;

export function AdventureScreen() {
  const [selectedRegion, setSelectedRegion] = useState<AdventureRegion | null>(null);
  const [selectedStage, setSelectedStage]   = useState<AdventureStage | null>(null);
  const [activeGame, setActiveGame]         = useState<ActiveGame>(null);
  const [playingStage, setPlayingStage]     = useState(false);
  const { addGold, addXP, adventureProgress } = usePlayerStore();

  const getStageProgress = (regionId: string, stageId: number) =>
    adventureProgress[`${regionId}-${stageId}`];

  const getRegionWithProgress = (region: AdventureRegion): AdventureRegion => {
    const stages = region.stages.map((stage) => {
      const prog = getStageProgress(region.id, stage.id);
      return prog ? { ...stage, completed: prog.completed, stars: prog.stars } : stage;
    });
    const allDone = stages.every((s) => s.completed);
    return {
      ...region,
      stages,
      status: region.status === 'locked' ? 'locked' : allDone ? 'completed' : 'available',
    };
  };

  const handlePlay = () => {
    if (!selectedRegion || !selectedStage) return;
    if (selectedRegion.id === 'river-district' && selectedStage.id === 1) {
      setSelectedStage(null);
      setSelectedRegion(null);
      setActiveGame('fish-tables');
      return;
    }
    setSelectedStage(null);
    setSelectedRegion(null);
    setPlayingStage(true);
    setTimeout(() => {
      addGold(50);
      addXP(100);
      setPlayingStage(false);
    }, 2000);
  };

  const handleGameComplete = (stars: number) => {
    setActiveGame(null);
    setSelectedRegion(getRegionWithProgress(REGIONS[0]));
  };

  if (activeGame === 'fish-tables') {
    return <FishTablesGame onComplete={handleGameComplete} />;
  }

  const regionsWithProgress = REGIONS.map(getRegionWithProgress);

  return (
    <div className="min-h-screen flex flex-col felt-dark-bg">
      <TopBar title="Adventure" showBack showCurrency />

      <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4">
        {/* World map title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h2 className="font-pixel text-2xl" style={{ color: '#ffb700', textShadow: '2px 2px 0 #8a6000' }}>
            WORLD MAP
          </h2>
          <p className="font-pixel text-[10px] mt-1" style={{ color: 'rgba(255,245,214,0.4)' }}>
            Defeat AI opponents to conquer each region
          </p>
        </motion.div>

        {/* Regions */}
        <div className="flex flex-col gap-4">
          {regionsWithProgress.map((region, i) => {
            const completedStages = region.stages.filter((s) => s.completed).length;
            const isLocked = region.status === 'locked';
            const isDone   = region.status === 'completed';

            return (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="balatro-panel overflow-hidden"
                style={{
                  opacity: isLocked ? 0.5 : 1,
                  ...(isDone ? { border: '3px solid #ffb700', boxShadow: '4px 4px 0 #b88a00' } : {}),
                }}
              >
                {/* Region header */}
                <div
                  className="p-4 flex items-center gap-3 cursor-pointer"
                  onClick={() => !isLocked && setSelectedRegion(selectedRegion?.id === region.id ? null : region)}
                >
                  {/* Icon */}
                  <div className="w-11 h-11 flex items-center justify-center text-xl shrink-0"
                    style={{
                      background: isDone ? '#b88a00' : isLocked ? '#1f1208' : '#3a8a4a',
                      border: `3px solid ${isDone ? '#8a6000' : isLocked ? '#7a4f2a' : '#1d5c2a'}`,
                      boxShadow: `3px 3px 0 ${isDone ? '#6a4800' : isLocked ? '#3a2010' : '#1d5c2a'}`,
                      borderRadius: 6,
                    }}>
                    {isLocked
                      ? <Lock className="w-5 h-5" style={{ color: 'rgba(255,245,214,0.3)' }} />
                      : isDone
                      ? '🏆'
                      : <Swords className="w-5 h-5 text-white" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-pixel text-sm" style={{ color: '#fff5d6' }}>{region.name}</h3>
                      {isDone && (
                        <span className="font-pixel text-[9px] px-2 py-0.5"
                          style={{ background: '#b88a00', border: '2px solid #8a6000', boxShadow: '2px 2px 0 #6a4800', borderRadius: 4, color: '#1a0f08' }}>
                          DONE
                        </span>
                      )}
                    </div>
                    <p className="font-pixel text-[10px] mt-0.5 truncate" style={{ color: 'rgba(255,245,214,0.4)' }}>
                      {isLocked ? '???' : region.flavor}
                    </p>
                    {!isLocked && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {region.stages.map((_, si) => (
                          <Star key={si} className="w-2.5 h-2.5"
                            style={{ color: si < completedStages ? '#ffb700' : 'rgba(255,183,0,0.2)', fill: si < completedStages ? '#ffb700' : 'none' }} />
                        ))}
                        <span className="font-pixel text-[9px] ml-1" style={{ color: 'rgba(255,245,214,0.35)' }}>
                          {completedStages}/{region.stages.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isLocked && (
                    <ChevronRight className="w-4 h-4 shrink-0 transition-transform"
                      style={{
                        color: 'rgba(255,245,214,0.3)',
                        transform: selectedRegion?.id === region.id ? 'rotate(90deg)' : 'rotate(0deg)',
                      }} />
                  )}
                </div>

                {/* Stage grid */}
                <AnimatePresence>
                  {selectedRegion?.id === region.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-2 grid grid-cols-3 gap-2"
                        style={{ borderTop: '3px solid rgba(0,0,0,0.4)' }}>
                        {region.stages.map((stage) => {
                          const isFishTables = region.id === 'river-district' && stage.id === 1;
                          const stageBg = stage.isBoss
                            ? '#e63946' : stage.completed
                            ? '#ffb700' : isFishTables
                            ? '#3a8a4a' : '#1f1208';
                          const stageBorder = stage.isBoss
                            ? '#a01e28' : stage.completed
                            ? '#b88a00' : isFishTables
                            ? '#1d5c2a' : '#7a4f2a';
                          const stageShadow = stage.isBoss
                            ? '#8a1920' : stage.completed
                            ? '#8a6000' : isFishTables
                            ? '#1d5c2a' : '#3a2010';

                          return (
                            <button
                              key={stage.id}
                              onClick={() => setSelectedStage(stage)}
                              className="p-2.5 flex flex-col items-center gap-1 cursor-pointer transition-all hover:scale-105"
                              style={{
                                background: stageBg,
                                border: `3px solid ${stageBorder}`,
                                boxShadow: `3px 3px 0 ${stageShadow}`,
                                borderRadius: 6,
                              }}
                            >
                              <span className="text-lg">
                                {stage.isBoss ? '👑' : stage.completed ? '✅' : isFishTables ? '🐟' : '⚔️'}
                              </span>
                              <span className="font-pixel text-[9px] text-center leading-tight"
                                style={{ color: stage.completed && !stage.isBoss ? '#1a0f08' : '#fff5d6' }}>
                                {stage.name}
                              </span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3].map((s) => (
                                  <Star key={s} className="w-2 h-2"
                                    style={{ color: s <= stage.stars ? '#ffb700' : 'rgba(255,183,0,0.2)', fill: s <= stage.stars ? '#ffb700' : 'none' }} />
                                ))}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stage modal */}
      <AnimatePresence>
        {selectedStage && selectedRegion && (
          <StageModal
            region={selectedRegion}
            stage={selectedStage}
            stageProgress={getStageProgress(selectedRegion.id, selectedStage.id)}
            onClose={() => setSelectedStage(null)}
            onPlay={handlePlay}
          />
        )}
      </AnimatePresence>

      {/* Battle in progress overlay */}
      <AnimatePresence>
        {playingStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="balatro-panel p-8 text-center">
              <div className="text-5xl mb-4 animate-bounce">⚔️</div>
              <p className="font-pixel text-xl" style={{ color: '#fff5d6' }}>Battle in progress...</p>
              <p className="font-pixel text-xs mt-2" style={{ color: 'rgba(255,245,214,0.4)' }}>Calculating GTO outcomes</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
