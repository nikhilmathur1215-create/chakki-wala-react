import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([])
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showAddressSelector, setShowAddressSelector] = useState(false)
  const [showSlotSelector, setShowSlotSelector] = useState(false)
  const navigate = useNavigate()
  const sessionId = localStorage.getItem('sessionId')

  const timeSlots = [
    { id: 1, name: 'Morning', time: '08:00 AM - 10:00 AM' },
    { id: 2, name: 'Late Morning', time: '10:00 AM - 12:00 PM' },
    { id: 3, name: 'Afternoon', time: '12:00 PM - 02:00 PM' },
    { id: 4, name: 'Evening', time: '04:00 PM - 06:00 PM' },
    { id: 5, name: 'Night', time: '06:00 PM - 08:00 PM' },
  ]

  useEffect(() => {
    loadCart()
    loadAddresses()
    const savedSlot = localStorage.getItem('selectedSlot')
    if (savedSlot) setSelectedSlot(savedSlot)
    const savedAddr = localStorage.getItem('selectedAddress')
    const savedLabel = localStorage.getItem('selectedAddressLabel')
    if (savedAddr) setSelectedAddress({ fullAddress: savedAddr, label: savedLabel })
  }, [])

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(cart)
  }

  const loadAddresses = async () => {
    if (sessionId) {
      try {
        const res = await api.get(`/addresses/${sessionId}`)
        setAddresses(res.data.addresses || [])
        const defaultAddr = res.data.addresses?.find(a => a.isDefault === 'true')
        if (defaultAddr && !selectedAddress) {
          setSelectedAddress(defaultAddr)
        }
      } catch (error) {
        console.error('Error loading addresses:', error)
      }
    }
  }

  const selectAddress = (addr) => {
    setSelectedAddress(addr)
    localStorage.setItem('selectedAddress', addr.fullAddress)
    localStorage.setItem('selectedAddressLabel', addr.label)
    setShowAddressSelector(false)
  }

  const selectSlot = (slot) => {
    setSelectedSlot(slot.time)
    localStorage.setItem('selectedSlot', slot.time)
    setShowSlotSelector(false)
  }

  const subtotal = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0)
  const deliveryFee = subtotal >= 500 ? 0 : 40
  const gst = subtotal * 0.05
  const total = subtotal + deliveryFee + gst

  const goToPayment = () => {
    if (!selectedAddress) {
      alert('Please select a delivery address')
      return
    }
    if (!selectedSlot) {
      alert('Please select a delivery slot')
      return
    }
    navigate('/payment')
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-400">shopping_cart</span>
        <p className="text-gray-500 mt-4">Your cart is empty</p>
        <Link to="/" className="mt-4 bg-primary text-white px-6 py-2 rounded-full">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 pb-32">
      {/* Back to Cart Link */}
      <div className="mb-4">
        <Link to="/cart" className="flex items-center gap-1 text-primary text-sm font-semibold">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Cart
        </Link>
      </div>

      <h2 className="text-lg font-bold mb-4">Checkout</h2>

      {/* Order Summary */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <h3 className="font-bold mb-2">Order Summary</h3>
        {cartItems.map((item, idx) => (
          <div key={idx} className="flex justify-between py-2 text-sm">
            <span>{item.name} ({item.weight}) x {item.quantity}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 my-2"></div>
        <div className="flex justify-between py-1"><span>Subtotal</span><span>₹{subtotal}</span></div>
        <div className="flex justify-between py-1"><span>Delivery Fee</span><span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
        <div className="flex justify-between py-1"><span>GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
        <div className="flex justify-between py-2 font-bold border-t border-gray-200 mt-2 pt-2">
          <span>Total</span>
          <span className="text-primary text-lg">₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Delivery Address Section - Editable */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">location_on</span>
            <div>
              <p className="text-xs text-gray-500">Delivery Address</p>
              <p className="font-semibold">{selectedAddress?.label || 'Not selected'}</p>
              {selectedAddress?.fullAddress && (
                <p className="text-xs text-gray-400 truncate max-w-[200px]">{selectedAddress.fullAddress}</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => setShowAddressSelector(!showAddressSelector)}
            className="text-primary text-sm font-semibold"
          >
            {selectedAddress ? 'Change' : 'Select'}
          </button>
        </div>
        
        {showAddressSelector && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500 mb-2">Select Address:</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {addresses.map(addr => (
                <button
                  key={addr.addressId}
                  onClick={() => selectAddress(addr)}
                  className={`w-full text-left p-2 rounded-lg border ${
                    selectedAddress?.addressId === addr.addressId 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200'
                  }`}
                >
                  <p className="font-semibold text-sm">{addr.label}</p>
                  <p className="text-xs text-gray-500 truncate">{addr.fullAddress}</p>
                </button>
              ))}
              <Link 
                to="/checkout" 
                onClick={() => setShowAddressSelector(false)}
                className="block text-center text-primary text-sm py-2"
              >
                + Add New Address
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Slot Section - Editable */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">schedule</span>
            <div>
              <p className="text-xs text-gray-500">Delivery Slot</p>
              <p className="font-semibold">{selectedSlot || 'Not selected'}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSlotSelector(!showSlotSelector)}
            className="text-primary text-sm font-semibold"
          >
            {selectedSlot ? 'Change' : 'Select'}
          </button>
        </div>
        
        {showSlotSelector && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500 mb-2">Select Time Slot:</p>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => selectSlot(slot)}
                  className={`p-2 rounded-lg text-sm border ${
                    selectedSlot === slot.time 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-200'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Make Payment Button */}
      <button 
        onClick={goToPayment}
        className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg mt-6 shadow-lg"
      >
        Make Payment →
      </button>
    </div>
  )
}

export default CheckoutPage
