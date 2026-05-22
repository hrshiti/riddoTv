import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import authService from './services/api/authService';
import appSettingsService from './services/api/appSettingsService';

export default function Login({ onClose, onSwitchToSignup, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [appSettings, setAppSettings] = useState(null);
  const [activeLegalModal, setActiveLegalModal] = useState(null); // 'terms' or 'privacy'

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await appSettingsService.getSettings();
        setAppSettings(data);
      } catch (err) {
        console.error("Failed to fetch app settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.login(formData.email, formData.password);
      onLoginSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="auth-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 10000, // Very high z-index
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            background: '#1a1a1a',
            borderRadius: '16px',
            padding: '24px', // Reduced padding
            width: '100%',
            maxWidth: '380px', // Slightly narrower
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            margin: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '1.75rem', // Reduced font size
              fontWeight: '800',
              color: 'white',
              marginBottom: '6px',
              letterSpacing: '-0.5px'
            }}>
              Welcome Back
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: '500' }}>
              Sign in to continue watching
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#888'
                }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    background: '#242424',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff0a16';
                    e.target.style.background = '#2a2a2a';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#333';
                    e.target.style.background = '#242424';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#888'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 44px',
                    background: '#242424',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff0a16';
                    e.target.style.background = '#2a2a2a';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#333';
                    e.target.style.background = '#242424';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                color: '#ef4444',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '0.85rem',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                background: '#ff0a16',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                marginBottom: '20px',
                boxShadow: '0 8px 24px rgba(255, 10, 22, 0.3)'
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </motion.button>

            {/* Switch to Signup */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  style={{
                    color: '#ff0a16',
                    background: 'none',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: '0 4px'
                  }}
                >
                  Sign up
                </button>
              </p>
            </div>

            {/* Legal Links Footer */}
            <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #333', paddingTop: '12px' }}>
              <p style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: '1.4' }}>
                By signing in, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('terms')}
                  style={{ color: '#9ca3af', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  Terms & Conditions
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('privacy')}
                  style={{ color: '#9ca3af', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  Privacy Policy
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Glassmorphic Legal Modal */}
      <AnimatePresence>
        {activeLegalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(15px)',
              zIndex: 20000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setActiveLegalModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              style={{
                background: '#181818',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '550px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.08)'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', margin: 0 }}>
                  {activeLegalModal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                </h3>
                <button
                  onClick={() => setActiveLegalModal(null)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    transition: 'all 0.2s',
                    fontSize: '14px'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div
                className="legal-content-scrollbar"
                style={{
                  padding: '24px',
                  overflowY: 'auto',
                  flex: 1,
                  color: '#d1d5db',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  textAlign: 'left'
                }}
              >
                {activeLegalModal === 'terms' ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: appSettings?.termsAndConditions?.content || '<h3>Terms & Conditions</h3><p>Riddo TV Terms & Conditions content goes here...</p>'
                    }}
                  />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: appSettings?.privacyPolicy?.content || '<h3>Privacy Policy</h3><p>Riddo TV Privacy Policy content goes here...</p>'
                    }}
                  />
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'right',
                background: '#141414'
              }}>
                <button
                  onClick={() => setActiveLegalModal(null)}
                  style={{
                    background: '#ff0a16',
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(255, 10, 22, 0.3)'
                  }}
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
