import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageThemeProvider } from './contexts/LanguageThemeContext';
import Home from './pages/Home';
import PlantIdentification from './pages/PlantIdentification';
import DiseaseDetection from './pages/DiseaseDetection';
import CareGuide from './pages/CareGuide';
import Reminders from './pages/Reminders';
import PlantLibrary from './pages/PlantLibrary';
import PlantDetails from './pages/PlantDetails';
import Login from './pages/Login';
import Profile from './pages/Profile';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import Header from './components/common/Header';
import Footer from './components/common/Footer';


const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = { type: 'tween' as const, duration: 0.25, ease: 'easeOut' as const };

function AnimatedRoutes() {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('home');
  const [currentParams, setCurrentParams] = useState<Record<string, string>>({});

  const navigateTo = (page: string, params?: Record<string, string>) => {
    setCurrentPage(page);
    if (params) setCurrentParams(params);
    else setCurrentParams({});
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'identify':
        return <PlantIdentification />;
      case 'disease':
        return <DiseaseDetection />;
      case 'care-guide':
        return <CareGuide />;
      case 'reminders':
        return <Reminders />;
      case 'library':
        return <PlantLibrary navigateTo={navigateTo} />;
      case 'plant-details':
        return <PlantDetails plantId={currentParams.id} />;
      case 'login':
        return <Login navigateTo={navigateTo} />;
      case 'profile':
        return <Profile navigateTo={navigateTo} />;
      default:
        return <Home navigateTo={navigateTo} />;
    }
  };

  return (
    <>
      <Header navigateTo={navigateTo} currentPage={currentPage} />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="min-h-full"
          >
            <Routes location={location}>
              <Route path="/" element={renderCurrentPage()} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer navigateTo={navigateTo} />
    </>
  );
}

export default function App() {
  return (
    <LanguageThemeProvider>
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="flex flex-col min-h-screen bg-surface-light dark:bg-surface-dark text-slate-800 dark:text-slate-100 font-sans antialiased">
            <AnimatedRoutes />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageThemeProvider>
  );
}
