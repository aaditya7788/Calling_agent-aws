// App.jsx
import { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Cookies from 'js-cookie';

import Header from './Components/Header';
import Dashboard from './Components/Dashboard';
import Call from './Components/Call';
import Login from './Components/Login';
import AuthForm from './Components/AuthForm';
import { handleLogout } from './store/auth_save';
import Campaign from './Components/Campaign';
import History from './Components/History';


const App = () => {
  const [Tab, setTab] = useState('dashboard');
  const [user, setUser] = useState(null); 
  const [authMethod, setAuthMethod] = useState('cognito'); // 'cognito' or 'google'
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; 
  console.log("Google Client ID:", GOOGLE_CLIENT_ID);

  // Restore user from localStorage (Cognito) or cookies (Google) on app load
  useEffect(() => {
    // Check for a frontend bypass for auth (useful for screenshots/demo)
    const BYPASS = String(import.meta.env.VITE_BYPASS_AUTH).toLowerCase() === 'true';
    if (BYPASS) {
      const mockUser = {
        name: 'Demo User',
        email: 'demo@example.com',
        id: 'demo-cognito-id',
        given_name: 'Demo',
        sub: 'demo-google-sub',
        picture: '/images/profile.png',
      };
      // Set user and keep auth method as 'cognito' so UI behaves consistently
      setUser(mockUser);
      setAuthMethod('cognito');
      console.log('VITE_BYPASS_AUTH enabled — using mock user for demo.');
      return;
    }
    // Check for Cognito user first
    const cognitoUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    
    if (cognitoUser && accessToken) {
      try {
        setUser(JSON.parse(cognitoUser));
        setAuthMethod('cognito');
        return;
      } catch (err) {
        console.error('Failed to parse Cognito user', err);
        localStorage.clear();
      }
    }

    // Fallback to Google OAuth
    const savedUser = Cookies.get('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setAuthMethod('google');
      } catch (err) {
        console.error('Failed to parse saved user', err);
        handleLogout();
      }
    }
  }, []);

  const data = {
    name: authMethod === 'cognito' 
      ? `${user?.name || 'User'}` 
      : `${user?.given_name || 'User'}`,
    email: `${user?.email || 'user@example.com'}`,
    picture: authMethod === 'cognito'
      ? '/images/profile.png'
      : `${user?.picture || '/images/profile.png'}`,
    googleId: authMethod === 'cognito'
      ? `${user?.id || ''}`
      : `${user?.sub || ''}`,
  };

  console.log('User Data:', data);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {!user ? (
        <div>
          {/* Use AuthForm for Cognito authentication */}
          <AuthForm setUser={setUser} />
          
          {/* Optional: Add Google OAuth as alternative */}
          {/* <div className="text-center mt-4">
            <p className="text-gray-600 mb-2">Or continue with Google</p>
            <Login setUser={setUser} />
          </div> */}
        </div>
      ) : (
        <div>
          <Header setTab={setTab} currentTab={Tab} Userdata={data} />
          {Tab === 'dashboard' ? (
            <Dashboard setTab={setTab} googleId={data.googleId} />
          ) : Tab === 'Call' ? (
            <Call googleId={data.googleId}/>
          ) : Tab === 'campaign' ? (
            <Campaign googleId={data.googleId} />
          ) : Tab === 'history' ? (
            <History googleId={data.googleId}/>
          ):null
          }       
        </div>
      )}
    </GoogleOAuthProvider>
  );
};

export default App;
