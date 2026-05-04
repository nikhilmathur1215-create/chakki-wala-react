import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AddressManager from './AddressManager'

const Header = () => {
  const [cartCount, setCartCount] = useState(0)
  const [showAddressManager, setShowAddressManager] = useState(false)
  const [selectedAddressLabel, setSelectedAddressLabel] = useState('Select Address')
  const isLoggedIn = localStorage.getItem('sessionId')
  const location = useLocation()

  const hideAddressOnPages = ['/checkout', '/payment']
  const showAddressDropdown = !hideAddressOnPages.includes(location.pathname)

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
      setCartCount(totalItems)
    }
    
    // Initial load
    updateCartCount()
    
    // Listen for both storage and custom cartUpdated events
    window.addEventListener('storage', updateCartCount)
    window.addEventListener('cartUpdated', updateCartCount)
    
    const savedLabel = localStorage.getItem('selectedAddressLabel')
    if (savedLabel) setSelectedAddressLabel(savedLabel)
    
    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cartUpdated', updateCartCount)
    }
  }, [])

  const handleAddressSelect = (address) => {
    setSelectedAddressLabel(address.label)
    setShowAddressManager(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm px-4 py-2 flex items-center justify-between z-50">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/images/Logo.png" 
            alt="Chakki Wala Logo" 
            className="w-24 h-12 object-contain"
            width="48"
            height="48"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          
        </Link>
        
        {showAddressDropdown && (
          <button 
            onClick={() => setShowAddressManager(true)}
            className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary text-sm font-semibold flex-1 mx-4"
          >
            <span className="material-symbols-outlined text-base">location_on</span>
            <span className="truncate max-w-[150px]">{selectedAddressLabel}</span>
            <span className="material-symbols-outlined text-base">expand_more</span>
          </button>
        )}
        
        {!showAddressDropdown && <div className="flex-1 mx-4"></div>}
        
        <div className="flex gap-3">
          <Link to="/cart" className="relative">
            <span className="material-symbols-outlined text-2xl text-primary">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {/* Profile Section - DISABLED */}
        </div>
      </header>

      {showAddressManager && (
        <AddressManager 
          onClose={() => setShowAddressManager(false)}
          onAddressSelect={handleAddressSelect}
        />
      )}
    </>
  )
}

export default Header
