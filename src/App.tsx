import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { HubScreen } from './screens/Hub';
import { LearnScreen } from './screens/Learn';
import { AdventureScreen } from './screens/Adventure';
import { ArenaScreen } from './screens/Arena';
import { ShopScreen } from './screens/Shop';
import { ProfileScreen } from './screens/Profile';
import { DeckScreen } from './screens/Profile/DeckPage';
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-1 flex flex-col"
      >
        <Routes location={location}>
          <Route path="/" element={<HubScreen />} />
          <Route path="/learn/*" element={<LearnScreen />} />
          <Route path="/adventure/*" element={<AdventureScreen />} />
          <Route path="/arena/*" element={<ArenaScreen />} />
          <Route path="/shop/*" element={<ShopScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/profile/deck" element={<DeckScreen />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div
        className="min-h-screen flex flex-col relative felt-dark-bg"
        style={{ color: '#fff5d6' }}
      >
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}
