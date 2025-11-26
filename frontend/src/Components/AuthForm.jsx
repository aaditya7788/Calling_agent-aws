import { useState } from 'react';
import axios from 'axios';
import Logo from './Logo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const AuthForm = ({ setUser }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'verify', 'forgot', 'reset'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    code: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      setMessage(response.data.message);
      setAuthMode('verify');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      
      // If user already exists, offer to resend OTP
      if (errorMessage.includes('already exists') || errorMessage.includes('User already exists')) {
        setError('Account already exists. Check your email for verification code or click below to resend.');
        setAuthMode('verify');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/auth/resend-code`, {
        email: formData.email
      });
      
      setMessage(response.data.message || 'Verification code sent to your email');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/verify-email`, {
        email: formData.email,
        code: formData.code
      });

      setMessage(response.data.message);
      setTimeout(() => {
        setAuthMode('login');
        setMessage('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      const { user, tokens } = response.data.data;

      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('idToken', tokens.idToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      // Store user data
      localStorage.setItem('user', JSON.stringify(user));

      // Set user in app state
      setUser(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email: formData.email
      });

      setMessage(response.data.message);
      setAuthMode('reset');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email: formData.email,
        code: formData.code,
        newPassword: formData.newPassword
      });

      setMessage(response.data.message);
      setTimeout(() => {
        setAuthMode('login');
        setMessage('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#122117]">
      <div className="bg-[#264533] border-2 border-[#38E07A] p-8 rounded-lg shadow-xl w-full max-w-md">
        {/* Header with Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <p className="text-gray-300">
            {authMode === 'login' && 'Welcome back! Please login to continue.'}
            {authMode === 'register' && 'Create your account'}
            {authMode === 'verify' && 'Verify your email'}
            {authMode === 'forgot' && 'Reset your password'}
            {authMode === 'reset' && 'Enter verification code'}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 text-red-200 rounded">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-900 bg-opacity-50 border border-green-500 text-green-200 rounded">
            {message}
          </div>
        )}

        {/* Login Form */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#38E07A] text-[#122117] font-semibold py-2 rounded-lg hover:bg-[#2bc465] transition disabled:bg-gray-600 disabled:text-gray-400"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-[#38E07A] hover:underline"
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('forgot')}
                className="text-[#38E07A] hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent"
                placeholder="Min. 8 characters"
              />
              <p className="text-xs text-gray-400 mt-1">
                Must contain uppercase, lowercase, and numbers
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#38E07A] text-[#122117] font-semibold py-2 rounded-lg hover:bg-[#2bc465] transition disabled:bg-gray-600 disabled:text-gray-400"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-[#38E07A] hover:underline"
              >
                Already have an account? Login
              </button>
            </div>
          </form>
        )}

        {/* Verify Email Form */}
        {authMode === 'verify' && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                maxLength={6}
                className="w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
              />
              <p className="text-xs text-gray-400 mt-1">
                Check your email for the 6-digit code
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#38E07A] text-[#122117] font-semibold py-2 rounded-lg hover:bg-[#2bc465] transition disabled:bg-gray-600 disabled:text-gray-400"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full bg-transparent border border-[#38E07A] text-[#38E07A] py-2 rounded-lg hover:bg-[#38E07A] hover:bg-opacity-10 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Resend Code'}
            </button>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-[#38E07A] hover:underline"
              >
                Back to login
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password Form */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#38E07A] text-[#122117] font-semibold py-2 rounded-lg hover:bg-[#2bc465] transition disabled:bg-gray-600 disabled:text-gray-400"
            >
              {loading ? 'Sending code...' : 'Send Reset Code'}
            </button>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-[#38E07A] hover:underline"
              >
                Back to login
              </button>
            </div>
          </form>
        )}

        {/* Reset Password Form */}
        {authMode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                maxLength={6}
                className="w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 bg-[#122117] border border-[#38E07A] text-white rounded-lg focus:ring-2 focus:ring-[#38E07A] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#38E07A] text-[#122117] font-semibold py-2 rounded-lg hover:bg-[#2bc465] transition disabled:bg-gray-600 disabled:text-gray-400"
            >
              {loading ? 'Resetting password...' : 'Reset Password'}
            </button>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-[#38E07A] hover:underline"
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
