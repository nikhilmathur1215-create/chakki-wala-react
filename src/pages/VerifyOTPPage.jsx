import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const VerifyOTPPage = ({ showToast }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState('');
  const inputs = useRef([]);
  const navigate = useNavigate();
  const mobile = localStorage.getItem('verifyMobile');

  useEffect(() => {
    if (!mobile) {
      navigate('/login');
    }
  }, [mobile, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '');
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await api.verifyOTP(mobile, otpValue);
      console.log('Verify response:', response);
      
      if (response.success && response.token) {
        // Store auth token
        localStorage.setItem('authToken', response.token);
        
        // Store user info
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        } else {
          localStorage.setItem('user', JSON.stringify({ mobile: mobile }));
        }
        
        // Merge guest cart with backend cart
        const guestCart = localStorage.getItem('cart');
        console.log('Guest cart before merge:', guestCart);
        
        if (guestCart) {
          try {
            const cartItems = JSON.parse(guestCart);
            if (cartItems.length > 0) {
              console.log('Syncing guest cart items:', cartItems.length);
              await api.syncCart(cartItems);
              console.log('Guest cart synced successfully!');
              localStorage.removeItem('cart');
            }
          } catch (err) {
            console.error('Cart sync error:', err);
          }
        }
        
        // Remove temporary data
        localStorage.removeItem('verifyMobile');
        
        // Trigger cart update event
        window.dispatchEvent(new Event('cartUpdated'));
        
        if (showToast) showToast('Login successful! Cart items preserved.', 'success');
        
        // Check if there was a pending checkout
        const pendingCheckout = localStorage.getItem('pendingCheckout');
        if (pendingCheckout) {
          localStorage.removeItem('pendingCheckout');
          // Use window.location for guaranteed redirect
          window.location.href = '/checkout';
        } else {
          // Use window.location for guaranteed redirect to home
          console.log('Redirecting to home page...');
          window.location.href = '/';
        }
      } else {
        setError(response.error || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimeLeft(30);
    setError('');
    try {
      const response = await api.sendOTP(mobile);
      if (response.success && response.testOtp) {
        if (showToast) showToast(`Test OTP: ${response.testOtp}`, 'info');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl text-primary">shield_person</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">Verification Required</h2>
        <p className="text-gray-500 mt-2">
          We've sent a 6-digit code to <span className="text-primary font-bold">+91 {mobile}</span>
        </p>

        <div className="flex justify-center gap-2 my-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-14 h-14 text-center text-2xl font-bold bg-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary outline-none"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}

        <p className="text-sm text-gray-500">Resend code in <span className="text-primary font-bold">{timeLeft}s</span></p>
        <button 
          onClick={handleResend} 
          disabled={timeLeft > 0} 
          className="text-primary text-sm mt-2 disabled:opacity-50"
        >
          Resend OTP
        </button>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg mt-6 disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? 'Verifying...' : 'Verify & Proceed →'}
        </button>
      </div>
    </div>
  );
};

export default VerifyOTPPage;