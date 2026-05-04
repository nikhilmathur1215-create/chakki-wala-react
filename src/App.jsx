import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Header from './components/Header'

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
  const currentPath = location.pathname

  const navItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/orders', label: 'Orders', icon: 'receipt_long' },
    { path: '/cart', label: 'Cart', icon: 'shopping_cart' },
    { path: '/profile', label: 'Profile', icon: 'person' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-2xl px-4 py-2 flex justify-around z-50">
      {navItems.map((item) => {
        const isActive = currentPath === item.path || 
          (item.path === '/orders' && currentPath.startsWith('/orders')) ||
          (item.path === '/cart' && currentPath === '/cart') ||
          (item.path === '/profile' && currentPath === '/profile')
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center transition-all ${
              isActive 
                ? 'text-primary' 
                : 'text-gray-500'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fafaf5] pb-16">
        <Header />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/track-order/:orderId" element={<OrderTrackerPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App
