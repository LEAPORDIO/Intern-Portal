import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import InternPortal from './components/InternPortal';
import { UserProgress } from './data/userData';
import { HybridUserDataManager } from './data/hybridUserDataManager';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  const userDataManager = HybridUserDataManager.getInstance();

  useEffect(() => {
    const initializeApp = async () => {
      // Check backend connection
      await userDataManager.recheckBackend();
      setConnectionStatus(userDataManager.isUsingBackend() ? 'online' : 'offline');
      
      // Check if user is already logged in
      const savedUser = localStorage.getItem('current_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          const user = await userDataManager.getUserData(userData.userId);
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Failed to restore user session:', error);
          localStorage.removeItem('current_user');
        }
      }
      
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      // Authenticate locally first
      const user = userDataManager.authenticateUser(username, password);
      
      if (user) {
        // Try to get latest data from backend
        const latestUser = await userDataManager.getUserData(user.userId);
        const finalUser = latestUser || user;
        
        setCurrentUser(finalUser);
        setIsAuthenticated(true);
        localStorage.setItem('current_user', JSON.stringify({ userId: finalUser.userId }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('current_user');
  };

  const refreshUserData = async () => {
    if (currentUser) {
      try {
        const updatedUser = await userDataManager.getUserData(currentUser.userId);
        if (updatedUser) {
          setCurrentUser(updatedUser);
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading...</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Connection: {connectionStatus === 'checking' ? 'Checking...' : connectionStatus}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Connection Status Indicator */}
      {connectionStatus !== 'checking' && (
        <div className={`fixed top-0 left-0 right-0 z-50 text-center py-1 text-xs ${
          connectionStatus === 'online' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {connectionStatus === 'online' ? '🟢 Connected to server' : '🟡 Offline mode - using local storage'}
        </div>
      )}
      
      <div className={connectionStatus !== 'checking' ? 'pt-6' : ''}>
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <InternPortal 
            user={currentUser!} 
            onLogout={handleLogout}
            onRefreshData={refreshUserData}
            connectionStatus={connectionStatus}
          />
        )}
      </div>
    </div>
  );
}

export default App;
