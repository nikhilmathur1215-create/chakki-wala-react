import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AddressManager from '../components/AddressManager'

const CartPage = ({ showToast }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddressManager, setShowAddressManager] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedAddressName, setSelectedAddressName] = useState('')
  const [showSlotSelector, setShowSlotSelector] = useState(false)
  const navigate = useNavigate()

  const timeSlots = [
    { id: 1, name: 'Morning', time: '08:00 AM - 10:00 AM' },
    { id: 2, name: 'Late Morning', time: '10:00 AM - 12:00 PM' },
    { id: 3, name: 'Afternoon', time: '12:00 PM - 02:00 PM' },
    { id: 4, name: 'Evening', time: '04:00 PM - 06:00 PM' },
    { id: 5, name: 'Night', time: '06:00 PM - 08:00 PM' },
  ]

  useEffect(() => {
    loadCart()
    const savedSlot = localStorage.getItem('selectedSlot')
    if (savedSlot) setSelectedSlot(savedSlot)
    
    const savedAddress = localStorage.getItem('selectedAddress')
    const savedLabel = localStorage.getItem('selectedAddressLabel')
    const savedName = localStorage.getItem('selectedAddressName')
    if (savedAddress) setSelectedAddress({ fullAddress: savedAddress, label: savedLabel })
    if (savedName) setSelectedAddressName(savedName)
  }, [])

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(cart)
    setLoading(false)
  }

  const updateQuantity = (productId, weight, newQuantity) => {
    if (newQuantity < 0) return
    let updated = [...cartItems]
    const index = updated.findIndex(i => i.productId === productId && i.weight === weight)
    if (newQuantity === 0) {
      updated.splice(index, 1)
      if (showToast) showToast('Item removed from cart', 'success')
    } else {
      updated[index].quantity = newQuantity
      if (showToast) showToast('Cart updated', 'success')
    }
    setCartItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address)
    const savedName = localStorage.getItem('selectedAddressName')
    if (savedName) setSelectedAddressName(savedName)
    setShowAddressManager(false)
    if (showToast) showToast('Delivery address updated', 'success')
  }

  const selectSlot = (slot) => {
    setSelectedSlot(slot.time)
    localStorage.setItem('selectedSlot', slot.time)
    setShowSlotSelector(false)
    if (showToast) showToast('Delivery slot selected', 'success')
  }

  const proceedToCheckout = () => {
    if (!selectedAddress) {
      if (showToast) showToast('Please select a delivery address', 'error')
      return
    }
    if (!selectedSlot) {
      if (showToast) showToast('Please select a delivery slot', 'error')
      return
    }
    
    // Store the selected address name for checkout
    const addressDetails = JSON.parse(localStorage.getItem('selectedAddressDetails') || '{}')
    localStorage.setItem('checkoutCustomerName', addressDetails.recipientName || selectedAddressName || 'Customer')
    
    navigate('/checkout')
  }

  const subtotal = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0)
  const deliveryFee = subtotal >= 500 ? 0 : 40
  const gst = subtotal * 0.05
  const total = subtotal + deliveryFee + gst
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  if (loading) return <div className="flex justify-center py-20"><div className="loading-spinner"></div></div>

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-400">shopping_cart</span>
        <p className="text-gray-500 mt-4">Your cart is empty</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-primary text-white px-6 py-2 rounded-full">Continue Shopping</button>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 py-4 pb-32">
        <h2 className="text-lg font-bold mb-4">My Cart ({totalItems} items)</h2>
        
        {cartItems.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 mb-3 flex gap-4 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-3xl text-primary">bakery_dining</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.weight}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-primary font-bold">₹{item.price}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)} className="w-8 h-8 rounded-full bg-gray-100">-</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)} className="w-8 h-8 rounded-full bg-primary text-white">+</button>
                </div>
              </div>
            </div>
          </div>
        ))}

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
                {selectedAddressName && (
                  <p className="text-xs text-gray-400">👤 {selectedAddressName}</p>
                )}
              </div>
            </div>
            <button onClick={() => setShowAddressManager(true)} className="text-primary text-sm font-semibold">
              {selectedAddress ? 'Change' : 'Select'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span>
              <div>
                <p className="text-xs text-gray-500">Delivery Slot</p>
                <p className="font-semibold">{selectedSlot || 'Not selected'}</p>
              </div>
            </div>
            <button onClick={() => setShowSlotSelector(!showSlotSelector)} className="text-primary text-sm font-semibold">
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
                    className={`p-2 rounded-lg text-sm border ${selectedSlot === slot.time ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200'}`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-green-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600">local_shipping</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-600">Free Delivery above ₹500</p>
              <div className="h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-full bg-green-600 rounded-full transition-all" style={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }}></div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">₹{Math.max(0, 500 - subtotal)}</p>
              <p className="text-xs">more to go</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl p-4">
          <div className="flex justify-between py-2"><span>Subtotal ({totalItems} items)</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between py-2"><span>Delivery Fee</span><span className={deliveryFee === 0 ? "text-green-600 font-bold" : ""}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span></div>
          <div className="flex justify-between py-2"><span>GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
          <div className="border-t border-gray-300 my-2"></div>
          <div className="flex justify-between py-2"><span className="text-xl font-bold">Total</span><span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span></div>
        </div>

        <button 
          onClick={proceedToCheckout}
          className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg mt-6 shadow-lg"
        >
          Proceed to Checkout →
        </button>
      </div>

      {showAddressManager && (
        <AddressManager 
          onClose={() => setShowAddressManager(false)}
          onAddressSelect={handleAddressSelect}
        />
      )}
    </>
  )
}

export default CartPage
