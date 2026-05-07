import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const PaymentPage = ({ showToast }) => {
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loading, setLoading] = useState(false)
  const [orderSummary, setOrderSummary] = useState({ subtotal: 0, deliveryFee: 0, gst: 0, total: 0 })
  const [customerName, setCustomerName] = useState('')
  const navigate = useNavigate()
  const sessionId = localStorage.getItem('sessionId')

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)
    const deliveryFee = subtotal >= 500 ? 0 : 40
    const gst = subtotal * 0.05
    setOrderSummary({ subtotal, deliveryFee, gst, total: subtotal + deliveryFee + gst })
    
    // Get customer name from selected address
    const savedName = localStorage.getItem('checkoutCustomerName')
    const addressDetails = JSON.parse(localStorage.getItem('selectedAddressDetails') || '{}')
    const name = savedName || addressDetails.recipientName || 'Customer'
    setCustomerName(name)
  }, [])

  const placeOrder = async () => {
    setLoading(true)
    const address = localStorage.getItem('selectedAddress')
    const slot = localStorage.getItem('selectedSlot')
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const total = orderSummary.total
    
    // Get the customer name from selected address
    const addressDetails = JSON.parse(localStorage.getItem('selectedAddressDetails') || '{}')
    const orderCustomerName = addressDetails.recipientName || customerName

    if (!sessionId) {
      if (showToast) showToast('Please login first', 'error')
      setLoading(false)
      return
    }

    if (!address) {
      if (showToast) showToast('Please select delivery address', 'error')
      setLoading(false)
      return
    }

    if (!slot) {
      if (showToast) showToast('Please select delivery slot', 'error')
      setLoading(false)
      return
    }

    try {
      const response = await api.post('/order/place', {
        sessionId,
        address,
        deliverySlot: slot,
        paymentMethod,
        customerName: orderCustomerName,
        orderDetails: { items: cart, total }
      })
      
      if (response.data.success) {
        localStorage.setItem('lastOrderId', response.data.orderId)
        localStorage.removeItem('cart')
        localStorage.removeItem('cartCount')
        localStorage.removeItem('checkoutCustomerName')
        window.dispatchEvent(new Event('cartUpdated'))
        window.dispatchEvent(new Event('storage'))
        
        if (showToast) {
          showToast('Order placed successfully! Redirecting...', 'success')
        }
        
        setTimeout(() => {
          navigate('/order-success')
        }, 1500)
      }
    } catch (error) {
      console.error('Order error:', error)
      if (showToast) showToast('Order failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-4 pb-32">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/checkout')} className="text-primary">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Payment</h2>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4 text-center">
        <p className="text-gray-500 text-sm">Amount to Pay</p>
        <p className="text-3xl font-bold text-primary">₹{orderSummary.total.toFixed(2)}</p>
      </div>

      <div className="bg-white rounded-xl p-4 mb-4">
        <h3 className="font-bold mb-3">Payment Method</h3>
        
        <label className="flex items-center justify-between p-3 border rounded-xl mb-2 cursor-pointer">
          <div className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">payments</span><span>Google Pay</span></div>
          <input type="radio" name="payment" checked={paymentMethod === 'gpay'} onChange={() => setPaymentMethod('gpay')} />
        </label>
        
        <label className="flex items-center justify-between p-3 border rounded-xl mb-2 cursor-pointer">
          <div className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">account_balance</span><span>PhonePe</span></div>
          <input type="radio" name="payment" checked={paymentMethod === 'phonepe'} onChange={() => setPaymentMethod('phonepe')} />
        </label>
        
        <label className="flex items-center justify-between p-3 border rounded-xl mb-2 cursor-pointer">
          <div className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">local_shipping</span><span>Cash on Delivery</span></div>
          <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
        </label>
      </div>

      <button onClick={placeOrder} disabled={loading} className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg shadow-lg disabled:opacity-50">
        {loading ? 'Processing...' : `Pay ₹${orderSummary.total.toFixed(2)}`}
      </button>
    </div>
  )
}

export default PaymentPage
