import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AddressManager from './AddressManager'

const Header = () => {
  const [cartCount, setCartCount] = useState(0)
  const [selectedAddressLabel, setSelectedAddressLabel] = useState('Select Address')
  const [showAddressDropdown, setShowAddressDropdown] = useState(false)
  const [showAddressManager, setShowAddressManager] = useState(false)
  const location = useLocation()
  const dropdownRef = useRef(null)

  const hideAddressOnPages = ['/checkout', '/payment']
  const showAddressButton = !hideAddressOnPages.includes(location.pathname)

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
      setCartCount(totalItems)
    }
    
    updateCartCount()
    window.addEventListener('storage', updateCartCount)
    window.addEventListener('cartUpdated', updateCartCount)
    
    const savedLabel = localStorage.getItem('selectedAddressLabel')
    if (savedLabel) setSelectedAddressLabel(savedLabel)
    
    return () => {
      window.removeEventListener('storage', updateCartCount)
      window.removeEventListener('cartUpdated', updateCartCount)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAddressDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleAddressDropdown = () => {
    setShowAddressDropdown(!showAddressDropdown)
  }

  const handleAddressSelect = (address) => {
    setSelectedAddressLabel(address.label)
    setShowAddressManager(false)
  }

  const getSavedAddresses = () => {
    return JSON.parse(localStorage.getItem('userAddresses') || '[]')
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm px-3 py-1 flex items-center justify-between z-50">
        {/* Logo Image - 40% larger */}
        <Link to="/" className="flex items-center shrink-0">
          <img 
            src="/images/Logo.png" 
            alt="Chakki Wala Logo" 
            className="w-[108px] h-[56px] object-contain"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 108 108"><circle cx="54" cy="54" r="54" fill="%23803d0a"/><text x="54" y="70" text-anchor="middle" fill="white" font-size="40" font-weight="bold">CW</text></svg>'
            }}
          />
        </Link>
        
        {/* Address Button - Wider */}
        {showAddressButton && (
          <div className="relative flex-1 max-w-[360px] mx-2" ref={dropdownRef}>
            <button 
              onClick={toggleAddressDropdown}
              className="w-full flex items-center justify-between gap-1 bg-primary/10 px-3 py-1.5 rounded-full text-primary text-sm font-semibold"
            >
              <div className="flex items-center gap-1 min-w-0">
                <span className="material-symbols-outlined text-base shrink-0">location_on</span>
                <span className="truncate text-sm">{selectedAddressLabel}</span>
              </div>
              <span className="material-symbols-outlined text-base shrink-0">expand_more</span>
            </button>
            
            {/* Dropdown Menu */}
            {showAddressDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border z-50 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <h4 className="text-xs font-bold text-gray-500 px-3 py-1">SELECT ADDRESS</h4>
                  
                  {getSavedAddresses().map((addr, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        localStorage.setItem('selectedAddress', addr.fullAddress)
                        localStorage.setItem('selectedAddressLabel', addr.label)
                        setSelectedAddressLabel(addr.label)
                        setShowAddressDropdown(false)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-primary text-sm shrink-0">home</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{addr.label}</p>
                        <p className="text-xs text-gray-500 truncate">{addr.fullAddress}</p>
                      </div>
                    </button>
                  ))}
                  
                  <div className="border-t my-1"></div>
                  
                  <button
                    onClick={() => {
                      setShowAddressManager(true)
                      setShowAddressDropdown(false)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2 text-primary"
                  >
                    <span className="material-symbols-outlined text-sm shrink-0">add_circle</span>
                    <span className="text-sm font-medium">Manage Addresses</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {!showAddressButton && <div className="flex-1 mx-2"></div>}
        
        {/* Cart Icon */}
        <Link to="/cart" className="relative shrink-0 ml-2">
          <span className="material-symbols-outlined text-2xl text-primary">shopping_cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </header>

      {/* Address Manager Modal */}
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
