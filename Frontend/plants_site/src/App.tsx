import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LazyMotion, m, AnimatePresence, domMax } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // استفاده از useAuth
import { LanguageThemeProvider, useLanguageTheme } from './contexts/LanguageThemeContext';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import PlantIdentification from './pages/PlantIdentification';
import DiseaseDetection from './pages/DiseaseDetection';
import CareGuide from './pages/CareGuide';
import Reminders from './pages/Reminders';
import PlantLibrary from './pages/PlantLibrary';
import Login from './pages/Login';
import Profile from './pages/Profile';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import PlantDetailsPage from './pages/PlantDetailsPage';
import MyGardenPage from './pages/MyGardenPage';
import PlantRecommender from './pages/PlantRecommender';
import type { JSX } from 'react';
import DiseaseDetailsPage from './pages/DiseaseDetailsPage';
import DiseaseLibrary from './pages/DiseaseLibrary';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth(); 
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = { type: 'tween' as const, duration: 0.25, ease: 'easeOut' as const };

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path === '/identify') return 'identify';
    if (path === '/disease') return 'disease';
    if (path === '/care-guide') return 'care-guide';
    if (path === '/reminder') return 'reminder';
    if (path === '/library') return 'library';
    if (path.startsWith('/blog')) return 'blog';
    if (path === '/login' || path === '/register') return 'login';
    if (path === '/profile') return 'profile';
    if (path === '/my-garden') return 'mygarden';
    if (path === '/about-us') return 'about-us';
    if (path === '/contact-us') return 'contact-us';
    return 'home';
  };

  const navigateTo = (page: string, params?: Record<string, string>) => {
    const routes: Record<string, string> = {
      'home': '/',
      'identify': '/identify',
      'disease': '/disease',
      'diseases': '/diseases',
      'care-guide': '/care-guide',
      'reminder': '/reminder',
      'garden': '/garden',
      'blog': '/blog',
      'login': '/login',
      'register': '/register',
      'profile': '/profile',
      'plant': '/plant/:id',   
      'mygarden': '/my-garden',
      'recommend': '/recommender',
      'about-us': '/about-us',
      'contact-us': '/contact-us',
    };
    let path = routes[page] || '/';
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, value);
      });
    }
    navigate(path);
  };

  return (
    <>
      <Header navigateTo={navigateTo} currentPage={getCurrentPage()} />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <m.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="min-h-full"
          >
            <Routes location={location}>
              <Route path="/" element={<Home navigateTo={navigateTo} />} />
              <Route path="/identify" element={ <ProtectedRoute><PlantIdentification /></ProtectedRoute>} />
              <Route path="/disease" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
              <Route path="/care-guide" element={<CareGuide />} />
              <Route path="/reminder" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
              <Route path="/garden" element={<PlantLibrary />} />
              <Route path="/my-garden" element={<ProtectedRoute><MyGardenPage /></ProtectedRoute> }  />
              <Route path="/recommender" element={<ProtectedRoute><PlantRecommender /></ProtectedRoute>} />
              <Route path="/plant/:id" element={<PlantDetailsPage navigateTo={navigateTo} plantId={(location.pathname.split('/')[2])} />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/login" element={<Login navigateTo={navigateTo} />} />
              <Route path="/register" element={<Login navigateTo={navigateTo} />} />
              <Route  path="/profile"  element={ <ProtectedRoute><Profile navigateTo={navigateTo} /></ProtectedRoute>  } />
              <Route path="/disease/:id" element={<DiseaseDetailsPage />} />
              <Route path="/diseases" element={<DiseaseLibrary />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact-us" element={<ContactUs />} />
            </Routes>
          </m.div>
        </AnimatePresence>
      </main>
      <Footer navigateTo={navigateTo} />
    </>
  );
}

function AppContent() {
  const { language } = useLanguageTheme();
  
  return (
    <div className={`${language === 'fa' ? 'font-vazirmatn' : 'font-sans'} flex flex-col min-h-screen bg-surface-light dark:bg-surface-dark text-slate-800 dark:text-slate-100 antialiased`}>
      <AnimatedRoutes />
      <Toaster position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <LanguageThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <LazyMotion features={domMax}>
            <AppContent />
          </LazyMotion>
        </BrowserRouter>
      </AuthProvider>
    </LanguageThemeProvider>
  );
}