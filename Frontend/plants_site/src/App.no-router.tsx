import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import PlantIdentification from './pages/PlantIdentification';
import DiseaseDetection from './pages/DiseaseDetection';
import CareGuide from './pages/CareGuide';
import Reminders from './pages/Reminders';
import PlantLibrary from './pages/PlantLibrary';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Simple route simulation without react-router-dom
const App = () => {
  // For demo purposes, we'll show the Home component
  // In a real app with proper routing, you would use react-router-dom
  const currentPage = window.location.pathname;

  let pageComponent;
  switch(currentPage) {
    case '/identify':
      pageComponent = <PlantIdentification />;
      break;
    case '/disease':
      pageComponent = <DiseaseDetection />;
      break;
    case '/care-guide':
      pageComponent = <CareGuide />;
      break;
    case '/reminders':
      pageComponent = <Reminders />;
      break;
    case '/library':
      pageComponent = <PlantLibrary />;
      break;
    case '/login':
      pageComponent = <Login navigateTo={() => {}} />;
      break;
    case '/profile':
      pageComponent = <Profile navigateTo={() => {}}  />;
      break;
    default:
      pageComponent = <Home navigateTo={() => {}} />;
  }

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header navigateTo={() => {}} currentPage={''} />
        <main className="flex-grow">
          {pageComponent}
        </main>
        <Footer navigateTo={() => {}} />
      </div>
    </AuthProvider>
  );
};

export default App;