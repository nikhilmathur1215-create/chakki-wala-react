import React, { useState, useEffect } from 'react'
import api from '../services/api'

const AddressDropdown = ({ onAddressSelect }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  // FIXED: Use authToken instead of sessionId
  const authToken = localStorage.getItem('authToken')

  useEffect(() => {
    if (authToken) {
      loadAddresses()
    }
    // Load saved address from localStorage
    const savedAddr = localStorage.getItem('selectedAddress')
    const savedLabel = localStorage.getItem('selectedAddressLabel')
    if (savedAddr) {
      setSelectedAddress({ fullAddress: savedAddr, label: savedLabel })
    }
  }, [authToken])

  const loadAddresses = async () => {
    try {
      const response = await api.getAddresses()
      if (response.success && response.addresses) {
        setAddresses(response.addresses)
        const defaultAddr = response.addresses.find(a => a.is_default)
        if (defaultAddr) {
          const fullAddress = `${defaultAddr.address_line1}, ${defaultAddr.address_line2 ? defaultAddr.address_line2 + ', ' : ''}${defaultAddr.city}, ${defaultAddr.state} - ${defaultAddr.pincode}`
          const addrObj = { ...defaultAddr, fullAddress, label: defaultAddr.label }
          setSelectedAddress(addrObj)
          localStorage.setItem('selectedAddress', fullAddress)
          localStorage.setItem('selectedAddressLabel', defaultAddr.label)
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error)
    }
  }

  const selectAddress = (addr) => {
    setSelectedAddress(addr)
    localStorage.setItem('selectedAddress', addr.fullAddress)
    localStorage.setItem('selectedAddressLabel', addr.label)
    setIsOpen(false)
    if (onAddressSelect) onAddressSelect(addr)
  }

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const address = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        setSelectedAddress({ fullAddress: address, label: 'Current Location' })
        localStorage.setItem('selectedAddress', address)
        localStorage.setItem('selectedAddressLabel', 'Current Location')
        setIsOpen(false)
        if (onAddressSelect) onAddressSelect({ fullAddress: address, label: 'Current Location' })
      }, () => {
        alert('Unable to get location')
      })
    } else {
      alert('Geolocation not supported')
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary text-sm font-semibold w-full"
      >
        <span className="material-symbols-outlined text-base">location_on</span>
        <span className="truncate max-w-[150px]">{selectedAddress?.label || 'Select Address'}</span>
        <span className="material-symbols-outlined text-base">expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border z-50">
          <div className="p-3 border-b">
            <h4 className="font-semibold text-sm">Select Delivery Address</h4>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {addresses.map(addr => {
              const fullAddress = `${addr.address_line1}, ${addr.address_line2 ? addr.address_line2 + ', ' : ''}${addr.city}, ${addr.state} - ${addr.pincode}`
              return (
                <button
                  key={addr.address_id}
                  onClick={() => selectAddress({ ...addr, fullAddress, label: addr.label })}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b flex items-start gap-2"
                >
                  <span className="material-symbols-outlined text-primary text-sm">home</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{addr.label}</p>
                    <p className="text-xs text-gray-500 truncate">{fullAddress}</p>
                  </div>
                  {selectedAddress?.address_id === addr.address_id && (
                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="p-2 border-t">
            <button
              onClick={useCurrentLocation}
              className="w-full text-left p-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-primary text-sm">my_location</span>
              Use Current Location
            </button>
            <button
              onClick={() => window.location.href = '/profile'}
              className="w-full text-left p-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm text-primary"
            >
              <span className="material-symbols-outlined text-sm">add_location</span>
              Add New Address
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddressDropdown
EOF