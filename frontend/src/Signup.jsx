import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Phone, User } from 'lucide-react';
import authService from './services/api/authService';

export default function Signup({ onClose, onSwitchToLogin, onSignupSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Limit phone number to 10 digits
    if (name === 'phone') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length > 10) return;
      setFormData({ ...formData, [name]: onlyNums });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (formData.name.trim().length < 2) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      await authService.signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      setSuccess('Account created successfully!');
      setTimeout(() => {
        onSignupSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
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
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
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
            padding: '20px', // Further reduced padding
            width: '100%',
            maxWidth: '380px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            margin: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: '800',
              color: 'white',
              marginBottom: '4px',
              fontFamily: 'var(--font-display)'
            }}>
              Create Account
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
              Join Riddo TV to start watching
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                color: '#e5e7eb',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 16px 10px 44px',
                    background: '#2a2a2a',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#46d369'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                color: '#e5e7eb',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
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
                    padding: '10px 16px 10px 44px',
                    background: '#2a2a2a',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#46d369'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>
            </div>

            {/* Phone Field */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                color: '#e5e7eb',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit number"
                  required
                  maxLength="10"
                  inputMode="numeric"
                  style={{
                    width: '100%',
                    padding: '10px 16px 10px 44px',
                    background: '#2a2a2a',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#46d369'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: '#e5e7eb',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 44px 10px 44px',
                    background: '#2a2a2a',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#46d369'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
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
                    color: '#6b7280',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: '#dc2626',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div style={{
                background: '#16a34a',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {success}
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                background: '#ff4d4d',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                marginBottom: '14px'
              }}
              onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#e63946')}
              onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#ff4d4d')}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </motion.button>

            {/* Switch to Login */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  style={{
                    color: '#ff4d4d',
                    background: 'none',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#e63946'}
                  onMouseLeave={(e) => e.target.style.color = '#ff4d4d'}
                >
                  Sign in
                </button>
              </span>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
