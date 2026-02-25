import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TopBar } from '../../components/ui/TopBar';
import { TacticalTable } from './TacticalTable';
import { LearnRangeMatrix } from './LearnRangeMatrix';
import { SessionDebrief } from './SessionDebrief';
import { LevelSelect } from './LevelSelect';
import { ExerciseSelect } from './ExerciseSelect';
import { ExampleHand } from './ExampleHand';
import { useGameStore } from '../../store/gameStore';
import { TIER_SCENARIOS, isExample } from './scenarios';
import type { TierID } from '../../types';

type LearnScreen = 'select' | 'exercises' | 'example' | 'tactical' | 'range' | 'debrief';

const SCREEN_TITLES: Record<LearnScreen, string> = {
  select:    'Training Grounds',
  exercises: 'Choose Exercise',
  example:   'Example Hand',
  tactical:  'Tactical Table',
  range:     'Range Analysis',
  debrief:   'Session Debrief',
};

export function LearnScreen() {
  const [screen, setScreen] = useState<LearnScreen>('select');
  const [selectedTier, setSelectedTier] = useState<TierID>('novice');
  const { reset, setActiveTier, setActiveExerciseIdx } = useGameStore();

  const handleSelectTier = (tierId: TierID) => {
    setSelectedTier(tierId);
    setActiveTier(tierId);
    setScreen('exercises');
  };

  const handleSelectExercise = (exerciseIdx: number) => {
    setActiveExerciseIdx(exerciseIdx);
    const exercise = TIER_SCENARIOS[selectedTier][exerciseIdx];
    reset(selectedTier);
    setScreen(isExample(exercise) ? 'example' : 'tactical');
  };

  return (
    <div className="min-h-screen flex flex-col felt-dark-bg">
      <TopBar
        title={SCREEN_TITLES[screen]}
        showBack={screen !== 'select'}
        showCurrency
      />

      <AnimatePresence mode="wait">
        {screen === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
            <LevelSelect onStartMission={handleSelectTier} />
          </motion.div>
        )}
        {screen === 'exercises' && (
          <motion.div key="exercises" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex-1 flex flex-col">
            <ExerciseSelect
              tierId={selectedTier}
              onSelectExercise={handleSelectExercise}
              onBack={() => setScreen('select')}
            />
          </motion.div>
        )}
        {screen === 'example' && (
          <motion.div key="example" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex-1 flex flex-col">
            <ExampleHand onComplete={() => setScreen('debrief')} />
          </motion.div>
        )}
        {screen === 'tactical' && (
          <motion.div key="tactical" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex-1 flex flex-col">
            <TacticalTable
              onAnalyzeRange={() => setScreen('range')}
              onComplete={() => setScreen('debrief')}
            />
          </motion.div>
        )}
        {screen === 'range' && (
          <motion.div key="range" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex-1 flex flex-col">
            <LearnRangeMatrix onBack={() => setScreen('tactical')} />
          </motion.div>
        )}
        {screen === 'debrief' && (
          <motion.div key="debrief" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="flex-1 flex flex-col">
            <SessionDebrief
              onHome={() => setScreen('select')}
              onReplay={() => { reset(selectedTier); setScreen('tactical'); }}
              onNextExercise={() => setScreen('exercises')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
