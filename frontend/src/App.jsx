import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/Navbar";
import PlanTrip from "./pages/PlanTrip";
import TripDates from "./pages/TripDates";
import TripResults from "./pages/TripResults";
import SelectInterests from "./pages/SelectInterests";

function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/plan" replace />} />
        <Route path="/plan" element={<Page><PlanTrip /></Page>} />
        <Route path="/interests" element={<SelectInterests />} />
        <Route path="/dates" element={<Page><TripDates /></Page>} />
        <Route path="/trip/:tripId" element={<Page><TripResults /></Page>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* ✅ Navbar always visible */}
      <Navbar />

      {/* ✅ Push pages below the sticky navbar height */}
      <div className="pt-[72px]">
        <Routes>
          <Route path="/" element={<Navigate to="/plan" replace />} />
          <Route path="/plan" element={<PlanTrip />} />
          <Route path="/dates" element={<TripDates />} />
          <Route path="/interests" element={<SelectInterests />} />
          <Route path="/trip/:tripId" element={<TripResults />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
