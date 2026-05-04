import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('gpay')
  const [loading, setLoading] = useState(false)
  const [orderSummary, setOrderSummary] = useState({ subtotal: 0, deliveryFee: 0, gst: 0, total: 0, items: [] })
  const navigate = useNavigate()
  const sessionId = localStorage.getItem('sessionId')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)
    const deliveryFee = subtotal >= 500 ? 0 : 40
    const gst = subtotal * 0.05
    setOrderSummary({ 
      subtotal, 
      deliveryFee, 
      gst, 
      total: subtotal + deliveryFee + gst,
      items: cart 
    })
  }, [])

  const placeOrder = async () => {
    setLoading(true)
    const address = localStorage.getItem('selectedAddress')
    const slot = localStorage.getItem('selectedSlot')
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const total = orderSummary.total

    // Create order object
    const orderId = `CKW-${Date.now()}`
    const newOrder = {
      orderId: orderId,
      orderDate: new Date().toISOString(),
      orderStatus: 'Confirmed',
      paymentMethod: paymentMethod,
      deliverySlot: slot,
      address: address,
      orderTotal: total,
      items: cart.map(item => ({
        name: item.name,
        weight: item.weight,
        quantity: item.quantity,
        price: item.price,
        itemTotal: item.price * item.quantity
      }))
    }

    // Save to localStorage orders array
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    existingOrders.unshift(newOrder) // Add new order at the beginning
    localStorage.setItem('orders', JSON.stringify(existingOrders))
    localStorage.setItem('lastOrderId', orderId)
    
    // Clear cart
    localStorage.removeItem('cart')
    
    // Try to save to backend if available
    try {
      const response = await api.post('/order/place', {
        sessionId,
        address,
        deliverySlot: slot,
        paymentMethod,
        orderDetails: { items: cart, total }
      })
      if (response.data.success) {
        console.log('Order saved to backend:', response.data.orderId)
      }
    } catch (error) {
      console.log('Backend not available, order saved locally')
    }
    
    setLoading(false)
    alert('Order placed successfully!')
    navigate('/order-success')
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
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">payments</span>
            <span>Google Pay</span>
          </div>
          <input type="radio" name="payment" checked={paymentMethod === 'gpay'} onChange={() => setPaymentMethod('gpay')} />
        </label>
        
        <label className="flex items-center justify-between p-3 border rounded-xl mb-2 cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">account_balance</span>
            <span>PhonePe</span>
          </div>
          <input type="radio" name="payment" checked={paymentMethod === 'phonepe'} onChange={() => setPaymentMethod('phonepe')} />
        </label>
        
        <label className="flex items-center justify-between p-3 border rounded-xl mb-2 cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            <span>Cash on Delivery</span>
          </div>
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
