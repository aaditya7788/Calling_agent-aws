// utils/auth.js
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const BASE_URL = import.meta.env.VITE_BASE_URL

export const handleLoginSuccess = async (credentialResponse, setUser) => {
  try {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser(decoded);
    console.log('Login successful:', decoded);
    Cookies.set('user', JSON.stringify(decoded), { expires: 1 / 24 });

    // Send to backend
    await fetch(`${BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decoded),
    });
  } catch (err) {
    console.error('Login decode error:', err);
  }
};


export const handleLogout = () => {
  // Clear Cognito tokens and user data
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('idToken');
  localStorage.removeItem('refreshToken');
  
  // Clear Google OAuth cookies
  Cookies.remove('user');
  
  // Reload to reset app state
  window.location.reload();
};
