import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import AddressManager from '../components/AddressManager'

const CartPage = ({ showToast }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedAddressDetails, setSelectedAddressDetails] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [isAfter6PM, setIsAfter6PM] = useState(false)
  const [showAddressManager, setShowAddressManager] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  const authToken = localStorage.getItem('authToken')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    setIsLoggedIn(!!authToken)
    loadCart()
    loadDeliverySlots()
    if (authToken) loadAddresses()
    loadSavedData()
    
    window.addEventListener('cartUpdated', loadCart)
    return () => window.removeEventListener('cartUpdated', loadCart)
  }, [authToken])

  const loadSavedData = () => {
    const savedSlot = localStorage.getItem('selectedSlot')
    if (savedSlot) setSelectedSlot(savedSlot)
    
    const savedAddress = localStorage.getItem('selectedAddress')
    const savedLabel = localStorage.getItem('selectedAddressLabel')
    if (savedAddress) {
      setSelectedAddress({ fullAddress: savedAddress, label: savedLabel })
    }
  }

  const loadAddresses = async () => {
    try {
      const response = await api.getAddresses()
      if (response.success && response.addresses) {
        setSavedAddresses(response.addresses)
        const defaultAddr = response.addresses.find(a => a.is_default)
        if (defaultAddr) {
          const fullAddress = `${defaultAddr.address_line1}, ${defaultAddr.address_line2 ? defaultAddr.address_line2 + ', ' : ''}${defaultAddr.city}, ${defaultAddr.state} - ${defaultAddr.pincode}`
          setSelectedAddress({ fullAddress, label: defaultAddr.label })
          setSelectedAddressDetails(defaultAddr)
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error)
    }
  }

  const loadDeliverySlots = async () => {
    try {
      const response = await api.getDeliverySlots()
      if (response.success) {
        setAvailableSlots(response.slots)
        setIsAfter6PM(response.isAfter6PM)
      }
    } catch (error) {
      console.error('Error loading slots:', error)
      setAvailableSlots([
        { id: 'slot1', name: 'Morning', time: '12:00 PM - 04:00 PM', startHour: 12, isAvailable: true },
        { id: 'slot2', name: 'Evening', time: '04:00 PM - 08:00 PM', startHour: 16, isAvailable: true },
        { id: 'slot3', name: 'Night', time: '08:00 PM - 10:00 PM', startHour: 20, isAvailable: true }
      ])
    }
  }

  const loadCart = () => {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]')
    console.log('Cart loaded from localStorage:', localCart.length, 'items')
    setCartItems(localCart)
    setLoading(false)
    
    if (authToken && localCart.length > 0) {
      api.syncCart(localCart).catch(err => console.error('Sync error:', err))
    }
  }

  const updateQuantity = (productId, weight, newQuantity) => {
    if (newQuantity < 0) return
    
    let cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const index = cart.findIndex(item => item.productId === productId && item.weight === weight)
    
    if (index !== -1) {
      if (newQuantity === 0) {
        cart.splice(index, 1)
        if (showToast) showToast('Item removed', 'success')
      } else {
        cart[index].quantity = newQuantity
        if (showToast) showToast('Cart updated', 'success')
      }
      
      localStorage.setItem('cart', JSON.stringify(cart))
      setCartItems(cart)
      window.dispatchEvent(new Event('cartUpdated'))
      
      if (authToken) {
        if (newQuantity === 0) {
          api.removeCartItem(productId, weight).catch(err => console.error('Error:', err))
        } else {
          api.updateCartItem(productId, weight, newQuantity).catch(err => console.error('Error:', err))
        }
      }
    }
  }

  const removeItem = (productId, weight) => {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart = cart.filter(item => !(item.productId === productId && item.weight === weight))
    localStorage.setItem('cart', JSON.stringify(cart))
    setCartItems(cart)
    window.dispatchEvent(new Event('cartUpdated'))
    if (showToast) showToast('Item removed', 'success')
    
    if (authToken) {
      api.removeCartItem(productId, weight).catch(err => console.error('Error:', err))
    }
  }

  const handleAddressSelect = (address) => {
    const fullAddress = `${address.address_line1}, ${address.address_line2 ? address.address_line2 + ', ' : ''}${address.city}, ${address.state} - ${address.pincode}`
    setSelectedAddress({ fullAddress, label: address.label })
    setSelectedAddressDetails(address)
    localStorage.setItem('selectedAddress', fullAddress)
    localStorage.setItem('selectedAddressLabel', address.label)
    setShowAddressManager(false)
    if (showToast) showToast('Delivery address updated', 'success')
  }

  const selectSlot = (slot) => {
    if (!slot.isAvailable) {
      if (showToast) showToast('This slot is no longer available', 'error')
      return
    }
    setSelectedSlot(slot.time)
    localStorage.setItem('selectedSlot', slot.time)
    if (showToast) showToast(`Delivery slot: ${slot.time}`, 'success')
  }

  const goToOrderReview = () => {
    if (!authToken) {
      if (showToast) showToast('Please login to place order', 'error')
      navigate('/login')
      return
    }

    if (!selectedAddress) {
      if (showToast) showToast('Please select a delivery address', 'error')
      setShowAddressManager(true)
      return
    }

    if (!selectedSlot) {
      if (showToast) showToast('Please select a delivery slot', 'error')
      return
    }

    if (cartItems.length === 0) {
      if (showToast) showToast('Your cart is empty', 'error')
      return
    }

    const subtotal = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0)
    const deliveryFee = subtotal >= 500 ? 0 : 40
    const gst = subtotal * 0.05
    const total = subtotal + deliveryFee + gst

    const addressObj = selectedAddressDetails || {
      recipientName: user.name || 'Customer',
      recipientMobile: user.mobile || '',
      fullAddress: selectedAddress.fullAddress
    }

    const orderDetails = {
      address: addressObj,
      deliverySlot: selectedSlot,
      items: cartItems,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      gst: gst,
      total: total
    }

    localStorage.setItem('pendingOrder', JSON.stringify(orderDetails))
    navigate('/checkout', { state: { orderDetails } })
  }

  const subtotal = cartItems.reduce((sum, i) => sum + (i.price * i.quantity), 0)
  const deliveryFee = subtotal >= 500 ? 0 : 40
  const gst = subtotal * 0.05
  const total = subtotal + deliveryFee + gst
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const freeDeliveryThreshold = 500
  const progressPercentage = Math.min(100, (subtotal / freeDeliveryThreshold) * 100)
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal)

  console.log('CartPage render - cartItems:', cartItems.length, 'totalItems:', totalItems)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-400">shopping_cart</span>
        <p className="text-gray-500 mt-4">Your cart is empty</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-primary text-white px-6 py-2 rounded-full">
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 py-4 pb-32">
        <h2 className="text-lg font-bold mb-4">My Cart ({totalItems} items)</h2>

        {cartItems.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 mb-3 flex gap-4 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <span className="material-symbols-outlined text-3xl text-primary">bakery_dining</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800">{item.name}</h3>
                <button onClick={() => removeItem(item.productId, item.weight)} className="text-gray-400 hover:text-red-500">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
              <p className="text-sm text-gray-500">{item.weight}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-primary font-bold text-lg">₹{item.price}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.productId, item.weight, item.quantity - 1)} 
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.weight, item.quantity + 1)} 
                    className="w-8 h-8 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right mt-1">
                <span className="text-xs text-gray-500">Total: ₹{item.price * item.quantity}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600">local_shipping</span>
              <span className="font-semibold text-sm">Free Delivery above ₹500</span>
            </div>
            <span className="text-sm font-bold text-primary">
              {subtotal >= 500 ? '✓ Free Delivery' : `Need ₹${amountToFreeDelivery} more`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {subtotal >= 500 
              ? '🎉 Congratulations! You get free delivery!' 
              : `Add ₹${amountToFreeDelivery} more worth of items to get free delivery`}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            <span className="font-semibold">Delivery Details</span>
          </div>

          {!isLoggedIn ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3">Login to add delivery address and place order</p>
              <button onClick={() => navigate('/login')} className="bg-primary text-white px-6 py-2 rounded-full text-sm">
                Login to Continue →
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Delivery Address</p>
                  <p className="font-semibold">{selectedAddress ? selectedAddress.label : 'Not selected'}</p>
                  {selectedAddress?.fullAddress && (
                    <p className="text-xs text-gray-400 truncate">{selectedAddress.fullAddress}</p>
                  )}
                </div>
                <button onClick={() => setShowAddressManager(true)} className="text-primary text-sm font-semibold">
                  {selectedAddress ? 'Change' : 'Select'}
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs text-gray-500">Delivery Slot</p>
                  <p className="font-semibold text-sm">{selectedSlot || 'Not selected'}</p>
                </div>

                {isAfter6PM && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                      ⚠️ Your order will be delivered NEXT DAY as we grind flour fresh after receiving your order.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => selectSlot(slot)}
                      disabled={!slot.isAvailable}
                      className={`p-3 rounded-xl text-center transition-all ${
                        selectedSlot === slot.time
                          ? 'bg-primary text-white shadow-md'
                          : slot.isAvailable
                          ? 'border-2 border-primary/30 bg-primary/5 text-gray-700 hover:bg-primary/10'
                          : 'border-2 border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <p className={`font-semibold text-sm ${selectedSlot === slot.time ? 'text-white' : 'text-gray-700'}`}>
                        {slot.name}
                      </p>
                      <p className={`text-xs mt-1 ${selectedSlot === slot.time ? 'text-white/80' : 'text-gray-500'}`}>
                        {slot.time}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-gray-100 rounded-xl p-4 mb-6">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal ({totalItems} items)</span>
            <span className="font-semibold">₹{subtotal}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Delivery Fee</span>
            <span className={deliveryFee === 0 ? "text-green-600 font-bold" : "font-semibold"}>
              {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">GST (5%)</span>
            <span className="font-semibold">₹{gst.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-300 my-2"></div>
          <div className="flex justify-between py-2">
            <span className="text-xl font-bold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {isLoggedIn && (
          <button
            onClick={goToOrderReview}
            disabled={!selectedAddress || !selectedSlot}
            className={`w-full py-4 rounded-full font-bold text-lg shadow-lg transition-all ${
              (!selectedAddress || !selectedSlot)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white active:scale-95'
            }`}
          >
            Review Order →
          </button>
        )}
      </div>

      {showAddressManager && isLoggedIn && (
        <AddressManager
          onClose={() => setShowAddressManager(false)}
          onAddressSelect={handleAddressSelect}
          savedAddresses={savedAddresses}
        />
      )}
    </>
  )
}

export default CartPage
