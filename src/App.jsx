import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Toast from './components/Toast'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import VerifyOTPPage from './pages/VerifyOTPPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrderTrackerPage from './pages/OrderTrackerPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'

const BottomNav = () => {
  const location = useLocation()
  const navItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/orders', label: 'Orders', icon: 'receipt_long' },
    { path: '/cart', label: 'Cart', icon: 'shopping_cart' },
    { path: '/profile', label: 'Profile', icon: 'person' },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-2xl px-4 py-2 flex justify-around z-50">
      {navItems.map(item => (
        <Link key={item.path} to={item.path} className={`flex flex-col items-center ${location.pathname === item.path ? 'text-primary' : 'text-gray-500'}`}>
          <span className="material-symbols-outlined text-2xl">{item.icon}</span>
          <span className="text-[10px] font-semibold">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

function App() {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 2000)
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fafaf5] pb-16">
        <Header showToast={showToast} />
        <main className="pt-[60px]">
          <Routes>
            <Route path="/" element={<HomePage showToast={showToast} />} />
            <Route path="/login" element={<LoginPage showToast={showToast} />} />
            <Route path="/verify-otp" element={<VerifyOTPPage showToast={showToast} />} />
            <Route path="/cart" element={<CartPage showToast={showToast} />} />
            <Route path="/checkout" element={<CheckoutPage showToast={showToast} />} />
            <Route path="/payment" element={<PaymentPage showToast={showToast} />} />
            <Route path="/order-success" element={<OrderSuccessPage showToast={showToast} />} />
            <Route path="/track-order/:orderId" element={<OrderTrackerPage showToast={showToast} />} />
            <Route path="/profile" element={<ProfilePage showToast={showToast} />} />
            <Route path="/orders" element={<OrdersPage showToast={showToast} />} />
          </Routes>
        </main>
        <BottomNav />
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </div>
    </BrowserRouter>
  )
}

export default App
