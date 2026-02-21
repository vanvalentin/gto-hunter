import React, { useState } from 'react';
import { Check, Lock, TrendingUp, Home, BarChart2, Box, User, Star, ArrowLeft, Radar, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const nodesData = [
    { id: 1, status: 'mastered', x: '50%', y: 600, delay: 0 },
    { id: 2, status: 'mastered', x: '50%', y: 500, delay: 0.1 },
    { id: 3, status: 'mastered', x: '25%', y: 400, delay: 0.2 },
    { id: 4, status: 'mastered', x: '75%', y: 400, delay: 0.2 },
    { id: 5, status: 'active', x: '50%', y: 300, delay: 0.3, label: 'Defending 3-Bets' },
    { id: 6, status: 'locked', x: '25%', y: 200, delay: 0.4 },
    { id: 7, status: 'locked', x: '75%', y: 200, delay: 0.4 },
    { id: 8, status: 'locked', x: '50%', y: 100, delay: 0.5 },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'tactical' | 'range' | 'debrief'>('dashboard');

  // Lifted state for TacticalTable
  const [street, setStreet] = useState(0);
  const [pot, setPot] = useState(24);
  const [oppBet, setOppBet] = useState(12);
  const [communityCards, setCommunityCards] = useState<{rank: string, suit: 's'|'h'|'c'|'d'}[]>([
    { rank: 'K', suit: 's' },
    { rank: '10', suit: 'h' },
    { rank: '4', suit: 'c' }
  ]);
  const [betSize, setBetSize] = useState(36);
  const [showInsight, setShowInsight] = useState(false);
  const [decision, setDecision] = useState<'fold' | 'call' | 'raise' | null>(null);

  const resetTacticalState = () => {
    setStreet(0);
    setPot(24);
    setOppBet(12);
    setCommunityCards([
      { rank: 'K', suit: 's' },
      { rank: '10', suit: 'h' },
      { rank: '4', suit: 'c' }
    ]);
    setBetSize(36);
    setShowInsight(false);
    setDecision(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#141414] font-sans relative flex flex-col overflow-hidden selection:bg-[#FFD100] selection:text-[#141414]">
      <AnimatePresence mode="wait">
        {currentScreen === 'dashboard' ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col h-full"
          >
            <Dashboard onNavigate={(screen) => {
              if (screen === 'tactical') resetTacticalState();
              setCurrentScreen(screen);
            }} />
          </motion.div>
        ) : currentScreen === 'tactical' ? (
          <motion.div 
            key="tactical"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col h-full"
          >
            <TacticalTable 
              onBack={() => setCurrentScreen('dashboard')} 
              onAnalyzeRange={() => setCurrentScreen('range')} 
              onComplete={() => setCurrentScreen('debrief')}
              gameState={{ street, pot, oppBet, communityCards, betSize, showInsight, decision }}
              setGameState={{ setStreet, setPot, setOppBet, setCommunityCards, setBetSize, setShowInsight, setDecision }}
            />
          </motion.div>
        ) : currentScreen === 'range' ? (
          <motion.div 
            key="range"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col h-full"
          >
            <RangeMatrix onBack={() => setCurrentScreen('tactical')} />
          </motion.div>
        ) : (
          <motion.div 
            key="debrief"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col h-full"
          >
            <SessionDebrief onHome={() => setCurrentScreen('dashboard')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Dashboard({ onNavigate }: { onNavigate: (screen: 'tactical') => void }) {
  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center p-4 md:p-6 md:px-8 z-20 relative bg-[#F4F4F0] border-b-[4px] border-[#141414]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FFD100] border-[4px] border-[#141414] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#141414] transform -rotate-6">
            <div className="w-4 h-4 md:w-5 md:h-5 bg-[#141414] rounded-full"></div>
          </div>
          <h1 className="font-black text-xl md:text-2xl tracking-tighter uppercase leading-none mt-1">
            GTO<br/>Hunter
          </h1>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 font-black text-lg md:text-xl">
              1,450 <Star className="w-4 h-4 md:w-5 md:h-5 fill-[#FFD100] text-[#141414] stroke-[3]" />
            </div>
            <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center text-green-600">
              <TrendingUp className="w-3 h-3 mr-1 stroke-[4]" /> +12
            </div>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white border-[4px] border-[#141414] rounded-full overflow-hidden shadow-[4px_4px_0px_0px_#141414]">
            <img src="https://picsum.photos/seed/avatar/100/100" alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      {/* Main Content - Tech Tree */}
      <main className="flex-1 relative w-full overflow-y-auto overflow-x-hidden pb-40 pt-6 md:pt-10 px-4 flex flex-col items-center custom-scrollbar">
          
          {/* Title Area */}
          <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-4 md:mb-8 text-center z-10 relative"
          >
              <div className="inline-block bg-[#FFD100] border-[4px] border-[#141414] px-6 py-2 rounded-full shadow-[4px_4px_0px_0px_#141414] transform rotate-2">
                  <h2 className="font-black text-lg md:text-xl uppercase tracking-widest">My Path</h2>
              </div>
          </motion.div>

          {/* Tree Container */}
          <div className="relative w-full max-w-[320px] md:max-w-[500px] h-[650px] mx-auto mt-4">
              {/* SVG Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                  {/* Mastered Lines (Solid) */}
                  <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5 }} x1="50%" y1="600" x2="50%" y2="500" stroke="#141414" strokeWidth="6" />
                  <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.7 }} x1="50%" y1="500" x2="25%" y2="400" stroke="#141414" strokeWidth="6" />
                  <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.7 }} x1="50%" y1="500" x2="75%" y2="400" stroke="#141414" strokeWidth="6" />
                  <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.9 }} x1="25%" y1="400" x2="50%" y2="300" stroke="#141414" strokeWidth="6" />
                  <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.9 }} x1="75%" y1="400" x2="50%" y2="300" stroke="#141414" strokeWidth="6" />
                  
                  {/* Locked Lines (Dashed) */}
                  <line x1="50%" y1="300" x2="25%" y2="200" stroke="#141414" strokeWidth="6" strokeDasharray="10 10" opacity="0.5" />
                  <line x1="50%" y1="300" x2="75%" y2="200" stroke="#141414" strokeWidth="6" strokeDasharray="10 10" opacity="0.5" />
                  <line x1="25%" y1="200" x2="50%" y2="100" stroke="#141414" strokeWidth="6" strokeDasharray="10 10" opacity="0.5" />
                  <line x1="75%" y1="200" x2="50%" y2="100" stroke="#141414" strokeWidth="6" strokeDasharray="10 10" opacity="0.5" />
              </svg>

              {/* Nodes */}
              {nodesData.map((node) => (
                  <div 
                      key={node.id} 
                      className="absolute z-10" 
                      style={{ left: node.x, top: `${node.y}px`, transform: 'translate(-50%, -50%)' }}
                  >
                      <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: node.delay }}
                      >
                          {node.status === 'active' ? (
                              <div className="relative cursor-pointer" onClick={() => onNavigate('tactical')}>
                                  <div className="absolute inset-[-8px] bg-[#FFD100] rounded-full animate-ping opacity-60"></div>
                                  <Node 
                                      status="active" 
                                      label={node.label} 
                                      icon={<div className="w-6 h-6 bg-[#141414] rounded-full"></div>} 
                                  />
                              </div>
                          ) : (
                              <Node 
                                  status={node.status as 'mastered' | 'locked'} 
                                  icon={node.status === 'mastered' ? <Check className="w-8 h-8 text-[#141414] stroke-[4]" /> : <Lock className="w-6 h-6 text-[#141414] stroke-[3]" />} 
                              />
                          )}
                      </motion.div>
                  </div>
              ))}
              
              {/* Decorative Elements */}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} className="absolute left-[5%] top-[550px] transform -rotate-12">
                  <Star className="w-8 h-8 fill-[#FFD100] text-[#141414] stroke-[3]" />
              </motion.div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} className="absolute right-[10%] top-[250px] transform rotate-45">
                  <Star className="w-6 h-6 fill-white text-[#141414] stroke-[3]" />
              </motion.div>
              <div className="absolute left-[85%] top-[500px] w-4 h-4 bg-[#141414] rounded-full"></div>
              <div className="absolute left-[15%] top-[100px] w-3 h-3 bg-[#FFD100] border-2 border-[#141414] rounded-full"></div>
          </div>
      </main>

      {/* Bottom Nav */}
      <div className="absolute bottom-8 left-0 w-full px-6 z-30 pointer-events-none">
          <motion.nav 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.8 }}
              className="bg-white border-[4px] border-[#141414] rounded-full px-6 md:px-8 py-3 md:py-4 flex justify-between items-center shadow-[6px_6px_0px_0px_#141414] max-w-[320px] md:max-w-[400px] mx-auto pointer-events-auto"
          >
              <button className="text-[#141414] hover:text-[#FFD100] transition-colors transform hover:scale-110 active:scale-95 cursor-pointer"><Home className="w-7 h-7 md:w-8 md:h-8 stroke-[2.5]" /></button>
              <button className="text-[#141414] hover:text-[#FFD100] transition-colors transform hover:scale-110 active:scale-95 cursor-pointer"><BarChart2 className="w-7 h-7 md:w-8 md:h-8 stroke-[2.5]" /></button>
              <button className="text-[#141414] hover:text-[#FFD100] transition-colors transform hover:scale-110 active:scale-95 cursor-pointer"><Box className="w-7 h-7 md:w-8 md:h-8 stroke-[2.5]" /></button>
              <button className="text-[#141414] hover:text-[#FFD100] transition-colors transform hover:scale-110 active:scale-95 cursor-pointer"><User className="w-7 h-7 md:w-8 md:h-8 stroke-[2.5]" /></button>
          </motion.nav>
      </div>
    </>
  );
}

function TacticalTable({ onBack, onAnalyzeRange, onComplete, gameState, setGameState }: any) {
  const { street, pot, oppBet, communityCards, betSize, showInsight, decision } = gameState;
  const { setStreet, setPot, setOppBet, setCommunityCards, setBetSize, setShowInsight, setDecision } = setGameState;

  const handleDecision = (action: 'fold' | 'call' | 'raise') => {
    setDecision(action);
    setShowInsight(true);
  };

  const advanceStreet = () => {
    setShowInsight(false);
    setDecision(null);
    if (decision === 'fold') {
      onComplete();
      return;
    }
    if (street === 0) {
      setStreet(1);
      setPot(48);
      setOppBet(24);
      setCommunityCards([...communityCards, { rank: '2', suit: 'd' }]);
      setBetSize(48);
    } else if (street === 1) {
      setStreet(2);
      setPot(96);
      setOppBet(0);
      setCommunityCards([...communityCards, { rank: 'J', suit: 'c' }]);
      setBetSize(48);
    } else {
      onComplete();
    }
  };

  let isOptimal = false;
  let ev = '';
  if (street === 0) {
    isOptimal = decision === 'call';
    ev = decision === 'call' ? '+2.15' : decision === 'raise' ? '-0.50' : '-1.20';
  } else if (street === 1) {
    isOptimal = decision === 'call';
    ev = decision === 'call' ? '+4.10' : decision === 'raise' ? '-1.50' : '-2.20';
  } else {
    isOptimal = decision === 'raise';
    ev = decision === 'raise' ? '+8.50' : decision === 'call' ? '+0.00' : '-5.00';
  }

  const outcomeText = isOptimal ? 'Optimal Decision' : 'Strategic Leak';
  const outcomeColor = isOptimal ? 'text-green-600' : 'text-red-500';
  const isHeroTurn = !showInsight;

  return (
    <div className="flex-1 flex flex-col bg-[#E5E5DF] relative overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center p-4 md:p-6 z-20 relative">
        <button 
          onClick={onBack}
          className="w-10 h-10 md:w-12 md:h-12 bg-white border-[3px] border-[#141414] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#141414] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" />
        </button>
        <div className="font-black text-sm md:text-base uppercase tracking-widest bg-white border-[3px] border-[#141414] px-4 py-2 rounded-full shadow-[2px_2px_0px_0px_#141414]">
          Hand #1042
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12"></div> {/* Spacer for centering */}
      </header>

      {/* Table Area */}
      <div className="flex-1 flex flex-col items-center justify-between py-8 px-4 relative z-10">
        
        {/* Opponent HUD */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#141414] text-white border-[3px] border-[#141414] rounded-2xl px-8 py-3 flex flex-col items-center relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]"
        >
          {/* Pulsating Action Indicator */}
          {!isHeroTurn && (
            <div className="absolute -top-2 -right-2">
              <div className="absolute inset-0 w-4 h-4 bg-amber-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-4 h-4 bg-amber-500 rounded-full border-2 border-[#141414]"></div>
            </div>
          )}
          
          <span className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-1">Opponent</span>
          <span className="font-black text-2xl text-[#FFD100]">100 <TechTerm term="BB" definition="Big Blind: The basic unit of measurement in poker." /></span>
        </motion.div>

        {/* The Board */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-6 w-full max-w-md"
        >
          <div className="bg-white border-[3px] border-[#141414] px-6 py-2 rounded-full shadow-[2px_2px_0px_0px_#141414]">
            <span className="font-black text-sm uppercase tracking-widest">Pot: {pot} <TechTerm term="BB" definition="Big Blind: The basic unit of measurement in poker." /></span>
          </div>
          
          <div className="flex justify-center gap-2 md:gap-4">
            {communityCards.map((card, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * idx }}>
                <PlayingCard rank={card.rank} suit={card.suit} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Hero HUD */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center relative mt-8 mb-4"
        >
          <div className="relative flex justify-center w-32 h-32">
            <PlayingCard rank="A" suit="h" className="absolute transform -rotate-6 -translate-x-6 z-0 shadow-[2px_2px_0px_0px_#141414]" />
            <PlayingCard rank="Q" suit="h" className="absolute transform rotate-6 translate-x-6 z-10 shadow-[4px_4px_0px_0px_#141414]" />
          </div>
        </motion.div>

      </div>

      {/* Decision Console */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.4 }}
        className="w-full bg-white border-t-[4px] border-[#141414] p-4 md:p-6 pb-8 z-30 shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          
          {/* Bet Slider */}
          <div className="flex items-center gap-4">
            <span className="font-black text-sm w-16 text-right">{oppBet > 0 ? oppBet : 12} <TechTerm term="BB" definition="Big Blind: The basic unit of measurement in poker." /></span>
            <input 
              type="range" 
              min={oppBet > 0 ? oppBet : 12} 
              max="100" 
              value={betSize}
              onChange={(e) => setBetSize(Number(e.target.value))}
              className="flex-1 h-3 bg-[#E5E5DF] border-[3px] border-[#141414] rounded-full appearance-none cursor-pointer 
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                [&::-webkit-slider-thumb]:bg-[#FFD100] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-[#141414] 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[2px_2px_0px_0px_#141414]"
            />
            <span className="font-black text-sm w-12">MAX</span>
          </div>

          {/* Action Panels */}
          <div className="flex gap-3 md:gap-4">
            {oppBet > 0 ? (
              <>
                <button 
                  onClick={() => handleDecision('fold')}
                  className="flex-1 bg-[#F4F4F0] border-[3px] border-[#141414] rounded-xl py-3 md:py-4 font-black text-sm md:text-base uppercase tracking-wider shadow-[2px_2px_0px_0px_#141414] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-95 cursor-pointer"
                >
                  Fold
                </button>
                <button 
                  onClick={() => handleDecision('call')}
                  className="flex-1 bg-[#FFD100] border-[3px] border-[#141414] rounded-xl py-3 md:py-4 font-black text-sm md:text-base uppercase tracking-wider shadow-[2px_2px_0px_0px_#141414] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-95 cursor-pointer"
                >
                  Call {oppBet} <TechTerm term="BB" definition="Big Blind: The basic unit of measurement in poker." />
                </button>
                <button 
                  onClick={() => handleDecision('raise')}
                  className="flex-1 bg-[#141414] text-white border-[3px] border-[#141414] rounded-xl py-3 md:py-4 font-black text-sm md:text-base uppercase tracking-wider shadow-[2px_2px_0px_0px_#141414] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-95 cursor-pointer"
                >
                  Raise {betSize}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleDecision('call')}
                  className="flex-1 bg-[#F4F4F0] border-[3px] border-[#141414] rounded-xl py-3 md:py-4 font-black text-sm md:text-base uppercase tracking-wider shadow-[2px_2px_0px_0px_#141414] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-95 cursor-pointer"
                >
                  Check
                </button>
                <button 
                  onClick={() => handleDecision('raise')}
                  className="flex-[2] bg-[#141414] text-white border-[3px] border-[#141414] rounded-xl py-3 md:py-4 font-black text-sm md:text-base uppercase tracking-wider shadow-[2px_2px_0px_0px_#141414] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-95 cursor-pointer"
                >
                  Bet {betSize} <TechTerm term="BB" definition="Big Blind: The basic unit of measurement in poker." />
                </button>
              </>
            )}
          </div>

        </div>
      </motion.div>

      {/* Insight Engine Overlay */}
      <AnimatePresence>
        {showInsight && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#141414]/40 backdrop-blur-sm z-40"
            />
            
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 w-full bg-white border-t-[4px] border-[#141414] rounded-t-3xl p-6 md:p-8 z-50 shadow-[0px_-8px_0px_0px_rgba(0,0,0,0.1)] flex flex-col items-center"
            >
              <div className="w-full max-w-2xl relative">
                {/* Drag Handle (Visual only, mobile) */}
                <div className="w-12 h-1.5 bg-[#E5E5DF] rounded-full mx-auto mb-6 md:hidden"></div>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <Radar className={`w-7 h-7 ${outcomeColor} stroke-[3]`} />
                  <h3 className={`font-black text-xl md:text-2xl uppercase tracking-widest ${outcomeColor}`}>
                    {outcomeText}
                  </h3>
                </div>

                {/* EV Delta */}
                <div className="mb-8">
                  <div className="font-black text-5xl md:text-6xl tracking-tighter mb-2">
                    <TechTerm term="EV" definition="Expected Value: The average outcome of a given play over the long run." />: {ev} <TechTerm term="BB" definition="Big Blind: The basic unit of measurement in poker." />
                  </div>
                  <div className="font-bold text-sm text-gray-500 uppercase tracking-widest">
                    {isOptimal ? 'Top 5% of possible outcomes.' : 'Suboptimal play detected.'}
                  </div>
                </div>

                {/* GTO Strategy Distribution */}
                <div className="mb-10">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3 px-1">
                    <span className="text-gray-500">Fold 15%</span>
                    <span className="text-[#141414]">Call 70%</span>
                    <span className="text-gray-500">Raise 15%</span>
                  </div>
                  <div className="w-full h-4 flex rounded-full overflow-hidden border-[3px] border-[#141414]">
                    <div className="h-full bg-[#E5E5DF] w-[15%] border-r-[3px] border-[#141414]"></div>
                    <div className="h-full bg-[#FFD100] w-[70%] border-r-[3px] border-[#141414]"></div>
                    <div className="h-full bg-[#141414] w-[15%]"></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 md:gap-4 w-full">
                  <button 
                    onClick={onAnalyzeRange}
                    className="flex-1 bg-white text-[#141414] border-[4px] border-[#141414] rounded-xl py-4 font-black text-sm md:text-base uppercase tracking-wider shadow-[4px_4px_0px_0px_#141414] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#141414] transition-all flex justify-center items-center cursor-pointer active:scale-[0.98]"
                  >
                    Range
                  </button>
                  <button 
                    onClick={advanceStreet}
                    className="flex-[2] bg-[#141414] text-white border-[4px] border-[#141414] rounded-xl py-4 font-black text-base md:text-lg uppercase tracking-wider shadow-[4px_4px_0px_0px_#FFD100] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#FFD100] transition-all flex justify-center items-center gap-2 active:scale-[0.98] cursor-pointer"
                  >
                    {decision === 'fold' || street === 2 ? 'Finish Hand' : 'Next Street'} <ArrowRight className="w-6 h-6 stroke-[3]" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

function RangeMatrix({ onBack }: { onBack: () => void }) {
  const [viewMode, setViewMode] = useState<'freq' | 'ev'>('freq');
  const [selectedHand, setSelectedHand] = useState('AKs');

  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

  const getHandData = (hand: string) => {
    let strategy = { raise: 0, call: 0, fold: 100 };
    let ev = -0.5;

    if (hand === 'AKs') {
      strategy = { raise: 80, call: 20, fold: 0 };
      ev = 3.4;
    } else if (['AA', 'KK', 'QQ', 'JJ', 'AKo', 'AQs'].includes(hand)) {
      strategy = { raise: 100, call: 0, fold: 0 };
      ev = 4.5;
    } else if (['TT', '99', 'AQo', 'AJs', 'KQs'].includes(hand)) {
      strategy = { raise: 50, call: 50, fold: 0 };
      ev = 1.2;
    } else if (['88', '77', 'AJo', 'ATs', 'KJs', 'QTs', 'JTs'].includes(hand)) {
      strategy = { raise: 0, call: 100, fold: 0 };
      ev = 0.5;
    } else if (['66', '55', 'ATo', 'A9s', 'A8s', 'KTo', 'QJo', 'JTo', 'T9s', '98s'].includes(hand)) {
      strategy = { raise: 0, call: 50, fold: 50 };
      ev = 0.1;
    } else {
      strategy = { raise: 0, call: 0, fold: 100 };
      ev = -0.5;
    }
    return { strategy, ev };
  };

  const getBackground = (strategy: any) => {
    const { raise, call, fold } = strategy;
    if (raise === 100) return '#141414';
    if (call === 100) return '#FFD100';
    if (fold === 100) return '#FFFFFF';
    
    const stops = [];
    let current = 0;
    if (raise > 0) {
      stops.push(`#141414 ${current}%`, `#141414 ${current + raise}%`);
      current += raise;
    }
    if (call > 0) {
      stops.push(`#FFD100 ${current}%`, `#FFD100 ${current + call}%`);
      current += call;
    }
    if (fold > 0) {
      stops.push(`#FFFFFF ${current}%`, `#FFFFFF ${current + fold}%`);
      current += fold;
    }
    return `linear-gradient(135deg, ${stops.join(', ')})`;
  };

  const getTextColor = (strategy: any) => {
    if (strategy.raise > 50) return '#FFFFFF';
    return '#141414';
  };

  const selectedData = getHandData(selectedHand);

  return (
    <div className="flex-1 flex flex-col bg-[#E5E5DF] relative overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center p-4 md:p-6 z-20 relative bg-[#F4F4F0] border-b-[4px] border-[#141414]">
        <button 
          onClick={onBack}
          className="w-10 h-10 md:w-12 md:h-12 bg-white border-[3px] border-[#141414] rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_#141414] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" />
        </button>
        <div className="font-black text-sm md:text-base uppercase tracking-widest text-center flex-1 mx-4">
          Villain's Perceived Range
        </div>
        <div className="flex items-center bg-white border-[3px] border-[#141414] rounded-xl overflow-hidden shadow-[2px_2px_0px_0px_#141414]">
          <button 
            onClick={() => setViewMode('freq')}
            className={`px-3 py-2 text-xs md:text-sm font-black uppercase tracking-wider transition-colors cursor-pointer ${viewMode === 'freq' ? 'bg-[#141414] text-white' : 'hover:bg-[#F4F4F0]'}`}
          >
            Freq
          </button>
          <button 
            onClick={() => setViewMode('ev')}
            className={`px-3 py-2 text-xs md:text-sm font-black uppercase tracking-wider transition-colors cursor-pointer ${viewMode === 'ev' ? 'bg-[#141414] text-white' : 'hover:bg-[#F4F4F0]'}`}
          >
            EV
          </button>
        </div>
      </header>

      {/* Main Content - Grid */}
      <main className="flex-1 relative w-full overflow-y-auto overflow-x-hidden p-4 md:p-8 flex flex-col items-center custom-scrollbar pb-64">
        <div className="w-full max-w-2xl aspect-square grid grid-cols-[repeat(13,minmax(0,1fr))] gap-[1px] md:gap-[2px] bg-[#141414] border-[4px] border-[#141414] rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_#141414]">
          {ranks.map((rowRank, rowIndex) => (
            ranks.map((colRank, colIndex) => {
              let hand = '';
              if (rowIndex < colIndex) hand = `${rowRank}${colRank}s`;
              else if (rowIndex > colIndex) hand = `${colRank}${rowRank}o`;
              else hand = `${rowRank}${colRank}`;
              
              const { strategy, ev } = getHandData(hand);
              const isSelected = selectedHand === hand;

              return (
                <div 
                  key={hand}
                  onClick={() => setSelectedHand(hand)}
                  className={`relative flex items-center justify-center cursor-pointer transition-transform ${isSelected ? 'z-10 scale-110 shadow-[0px_0px_0px_3px_#FFD100]' : 'hover:scale-105 hover:z-10'}`}
                  style={{ background: getBackground(strategy), color: getTextColor(strategy) }}
                >
                  <span className="font-bold text-[8px] md:text-xs tracking-tighter">
                    {viewMode === 'freq' ? hand : ev > 0 ? `+${ev}` : ev}
                  </span>
                </div>
              );
            })
          ))}
        </div>
      </main>

      {/* Inspector Panel */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t-[4px] border-[#141414] p-4 md:p-6 z-30 shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto">
          {/* Legend */}
          <div className="flex justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#141414] border-2 border-[#141414] rounded-sm"></div>
              <span className="font-bold text-xs uppercase tracking-widest text-gray-500">Raise</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FFD100] border-2 border-[#141414] rounded-sm"></div>
              <span className="font-bold text-xs uppercase tracking-widest text-gray-500">Call</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FFFFFF] border-2 border-[#141414] rounded-sm"></div>
              <span className="font-bold text-xs uppercase tracking-widest text-gray-500">Fold</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#F4F4F0] border-[3px] border-[#141414] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#141414]">
            <div className="flex items-center gap-4">
              <div className="bg-white border-[3px] border-[#141414] rounded-xl px-4 py-2 font-black text-xl shadow-[2px_2px_0px_0px_#141414]">
                {selectedHand === 'AKs' ? 'A♠ K♠' : selectedHand === 'AKo' ? 'A♣ K♠' : selectedHand}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs uppercase tracking-widest text-gray-500">Expected Value</span>
                <span className={`font-black text-xl ${selectedData.ev > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {selectedData.ev > 0 ? '+' : ''}{selectedData.ev} <TechTerm term="BB" definition="Big Blind: The basic unit of measurement in poker." />
                </span>
              </div>
            </div>

            <div className="flex-1 w-full md:w-auto md:ml-8">
              <span className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-1 block">Solver Action</span>
              <div className="flex items-center gap-2">
                {selectedData.strategy.raise > 0 && <span className="font-black text-sm">Raise {selectedData.strategy.raise}%</span>}
                {selectedData.strategy.raise > 0 && selectedData.strategy.call > 0 && <span className="text-gray-400">/</span>}
                {selectedData.strategy.call > 0 && <span className="font-black text-sm">Call {selectedData.strategy.call}%</span>}
                {(selectedData.strategy.raise > 0 || selectedData.strategy.call > 0) && selectedData.strategy.fold > 0 && <span className="text-gray-400">/</span>}
                {selectedData.strategy.fold > 0 && <span className="font-black text-sm">Fold {selectedData.strategy.fold}%</span>}
              </div>
              <div className="w-full h-3 mt-2 flex rounded-full overflow-hidden border-[2px] border-[#141414]">
                {selectedData.strategy.fold > 0 && <div className="h-full bg-white border-r-[2px] border-[#141414]" style={{ width: `${selectedData.strategy.fold}%` }}></div>}
                {selectedData.strategy.call > 0 && <div className="h-full bg-[#FFD100] border-r-[2px] border-[#141414]" style={{ width: `${selectedData.strategy.call}%` }}></div>}
                {selectedData.strategy.raise > 0 && <div className="h-full bg-[#141414]" style={{ width: `${selectedData.strategy.raise}%` }}></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayingCard({ rank, suit, className = "" }: { rank: string, suit: 's' | 'h' | 'c' | 'd', className?: string }) {
  const isRed = suit === 'h' || suit === 'd';
  const suitIcon = suit === 's' ? '♠' : suit === 'h' ? '♥' : suit === 'c' ? '♣' : '♦';
  
  return (
      <div className={`w-16 h-24 md:w-20 md:h-28 bg-white border-[3px] border-[#141414] rounded-xl flex flex-col justify-between p-2 shadow-[3px_3px_0px_0px_#141414] ${className}`}>
          <div className={`text-xl md:text-2xl font-black leading-none ${isRed ? 'text-[#FF4444]' : 'text-[#141414]'}`}>{rank}</div>
          <div className={`text-3xl md:text-4xl self-end leading-none ${isRed ? 'text-[#FF4444]' : 'text-[#141414]'}`}>{suitIcon}</div>
      </div>
  );
}

function Node({ status, icon, label }: { status: 'mastered' | 'active' | 'locked', icon: React.ReactNode, label?: string }) {
    const baseClasses = "rounded-full border-[4px] border-[#141414] flex items-center justify-center relative transition-transform hover:scale-110 cursor-pointer";
    
    let statusClasses = "";
    let sizeClasses = "w-14 h-14 md:w-16 md:h-16";
    
    if (status === 'mastered') {
        statusClasses = "bg-[#FFD100] shadow-[4px_4px_0px_0px_#141414]";
    } else if (status === 'active') {
        statusClasses = "bg-white shadow-[6px_6px_0px_0px_#141414] z-10";
        sizeClasses = "w-16 h-16 md:w-20 md:h-20"; // Slightly larger
    } else if (status === 'locked') {
        statusClasses = "bg-[#E5E5DF] shadow-[2px_2px_0px_0px_#141414] opacity-90";
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`${baseClasses} ${statusClasses} ${sizeClasses}`}>
                {icon}
            </div>
            {label && (
                <div className="absolute top-full mt-3 md:mt-4 bg-white border-[4px] border-[#141414] px-4 md:px-5 py-1.5 md:py-2 rounded-xl shadow-[4px_4px_0px_0px_#141414] whitespace-nowrap z-30 font-black text-xs md:text-sm uppercase tracking-wider transform -rotate-2">
                    {label}
                </div>
            )}
        </div>
    );
}

function TechTerm({ term, definition }: { term: string, definition: string }) {
  return (
    <span className="relative group inline-block cursor-help">
      <span className="underline decoration-dotted decoration-[0.05em] underline-offset-[0.1em]">{term}</span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#141414] text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] text-center font-bold normal-case tracking-normal shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
        {definition}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#141414]"></div>
      </div>
    </span>
  );
}

function SessionDebrief({ onHome }: { onHome: () => void }) {
  return (
    <div className="flex-1 flex flex-col bg-[#E5E5DF] relative overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar">
      <header className="text-center mt-8 mb-8">
        <h1 className="font-black text-3xl md:text-4xl uppercase tracking-tighter text-[#141414]">Session Debrief</h1>
        <p className="font-bold text-sm text-gray-500 uppercase tracking-widest mt-2">Today, 2:45 PM</p>
      </header>

      <div className="flex-1 flex flex-col items-center max-w-md mx-auto w-full gap-8 pb-12">
        {/* Mastery Shift Gauge */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#D4D4D0" strokeWidth="8" />
            <motion.circle 
              initial={{ strokeDasharray: "0 251.2" }}
              animate={{ strokeDasharray: "180 251.2" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="50" cy="50" r="40" fill="none" stroke="#FFD100" strokeWidth="8" strokeLinecap="round" 
            />
          </svg>
          <div className="flex flex-col items-center z-10">
            <span className="font-black text-5xl text-[#141414] tracking-tighter">1465</span>
            <span className="font-bold text-sm text-green-600 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(22,163,74,0.8)]">+15 Points</span>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <MetricCard title="Accuracy" value="88%" valueColor="text-cyan-500" />
          <MetricCard title="Decisions" value="25" valueColor="text-white" />
          <MetricCard title="Biggest Leak" value="Folded to 3-Bet" valueColor="text-amber-400" isSmall />
          <MetricCard title="Best Move" value="River Hero Call" valueColor="text-green-400" subValue="+4.5 EV" isSmall />
        </div>

        {/* Next Steps Banner */}
        <div className="w-full bg-white border-[3px] border-[#141414] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#141414] flex items-center gap-4 mt-2">
          <div className="w-12 h-12 bg-[#FFD100] border-[3px] border-[#141414] rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <span className="font-bold text-[10px] uppercase tracking-widest text-gray-500 block mb-1">Next Steps</span>
            <span className="font-black text-sm md:text-base leading-tight block">Recommended: Defending the 3-Bet Module</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto pt-4 w-full max-w-md mx-auto">
        <button 
          onClick={onHome}
          className="w-full bg-[#141414] text-white border-[4px] border-[#141414] rounded-xl py-4 font-black text-base md:text-lg uppercase tracking-wider shadow-[4px_4px_0px_0px_#FFD100] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#FFD100] transition-all cursor-pointer active:scale-[0.98]"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}

function MetricCard({ title, value, valueColor, subValue, isSmall }: any) {
  return (
    <div className="bg-[#141414] border-[3px] border-[#141414] rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] flex flex-col justify-center">
      <span className="font-bold text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mb-1">{title}</span>
      <span className={`font-black ${isSmall ? 'text-sm md:text-base' : 'text-2xl md:text-3xl'} ${valueColor} leading-tight`}>{value}</span>
      {subValue && <span className="font-bold text-[10px] text-gray-500 mt-1">{subValue}</span>}
    </div>
  );
}
