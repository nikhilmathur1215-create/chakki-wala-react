import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([])
  const [address, setAddress] = useState('')
  const [addressLabel, setAddressLabel] = useState('')
  const [slot, setSlot] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const sessionId = localStorage.getItem('sessionId')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    // Load cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(cart)
    
    // Load saved address
    const savedAddress = localStorage.getItem('selectedAddress')
    const savedLabel = localStorage.getItem('selectedAddressLabel')
    if (savedAddress) {
      setAddress(savedAddress)
      setAddressLabel(savedLabel || 'Delivery Address')
    }
    
    // Load saved slot
    const savedSlot = localStorage.getItem('selectedSlot')
    if (savedSlot) {
      setSlot(savedSlot)
    }
  }

  const subtotal = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0)
  const deliveryFee = subtotal >= 500 ? 0 : 40
  const gst = subtotal * 0.05
  const total = subtotal + deliveryFee + gst

  const proceedToPayment = () => {
    if (!address) {
      alert('Please add a delivery address. Go back to cart and select address.')
      return
    }
    if (!slot) {
      alert('Please select a delivery slot. Go back to cart and select slot.')
      return
    }
    
    setLoading(true)
    // Store order summary for payment page
    localStorage.setItem('orderSummary', JSON.stringify({
      items: cartItems,
      subtotal,
      deliveryFee,
      gst,
      total,
      address,
      slot
    }))
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

      {/* Delivery Address - Read Only */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary">location_on</span>
          <h3 className="font-semibold">Delivery Address</h3>
        </div>
        {address ? (
          <>
            <p className="text-sm font-medium text-primary">{addressLabel}</p>
            <p className="text-sm text-gray-600 mt-1">{address}</p>
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 mb-2">No address selected</p>
            <Link to="/cart" className="text-primary text-sm font-semibold inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Go to Cart to add address
            </Link>
          </div>
        )}
      </div>

      {/* Delivery Slot - Read Only */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary">schedule</span>
          <h3 className="font-semibold">Delivery Slot</h3>
        </div>
        {slot ? (
          <p className="text-sm text-gray-600">{slot}</p>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 mb-2">No delivery slot selected</p>
            <Link to="/cart" className="text-primary text-sm font-semibold inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Go to Cart to select slot
            </Link>
          </div>
        )}
      </div>

      {/* Proceed Button */}
      <button 
        onClick={proceedToPayment}
        disabled={!address || !slot || loading}
        className={`w-full py-4 rounded-full font-bold text-lg shadow-lg transition-all ${
          (!address || !slot) 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-primary text-white active:scale-95'
        }`}
      >
        {loading ? 'Processing...' : 'Proceed to Payment →'}
      </button>
      
      {/* Warning message if address or slot missing */}
      {(!address || !slot) && (
        <p className="text-center text-xs text-gray-500 mt-4">
          Please go back to cart and select both delivery address and time slot
        </p>
      )}
    </div>
  )
}

export default CheckoutPage
