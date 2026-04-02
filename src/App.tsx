import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Areas } from './pages/Areas';
import { Users } from './pages/Users';
import { Schedule } from './pages/Schedule';
import { SmsLogs } from './pages/SmsLogs';
import { WaterFlow } from './pages/WaterFlow';
import { Sidebar } from './components/Sidebar';
import { Loading } from './components/Loading';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'areas':
        return <Areas />;
      case 'users':
        return <Users />;
      case 'schedule':
        return <Schedule />;
      case 'waterflow':
        return <WaterFlow />;
      case 'sms':
        return <SmsLogs />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-y-auto p-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
