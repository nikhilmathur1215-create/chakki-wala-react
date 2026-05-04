import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const LoginPage = () => {
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const sendOTP = async () => {
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      alert('Please enter valid 10-digit mobile number')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/send-otp', { mobile })
      if (res.data.success) {
        localStorage.setItem('verifyMobile', mobile)
        if (res.data.testOtp) alert(`Test OTP: ${res.data.testOtp}`)
        navigate('/verify-otp')
      }
    } catch (error) {
      alert('Failed to send OTP. Make sure backend is running on port 3000')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-surface">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-5xl text-primary">bakery_dining</span>
          </div>
          <h2 className="text-3xl font-extrabold text-on-surface mt-4">
            Welcome to <span className="text-primary">Chakki Waala</span>
          </h2>
          <p className="text-on-surface-variant mt-2">Enter your mobile number to continue</p>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Mobile Number</label>
          <div className="relative flex items-center bg-gray-100 rounded-xl overflow-hidden">
            <span className="pl-5 pr-3 font-bold border-r border-gray-300">+91</span>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="98765 43210"
              className="w-full bg-transparent py-5 px-4 text-lg font-semibold outline-none"
              maxLength={10}
            />
          </div>
        </div>

        <button
          onClick={sendOTP}
          disabled={loading}
          className="w-full bg-primary text-white py-5 rounded-full font-bold text-lg shadow-lg disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send OTP'}
        </button>

        <p className="text-xs text-center text-gray-500 mt-8">By continuing, you agree to our Terms of Service</p>
      </div>
    </div>
  )
}

export default LoginPage
