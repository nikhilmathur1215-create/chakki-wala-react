import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCode } from 'react-qr-code';
import api from '../services/api';

const UPI_ID = '8800244169@upi';
const UPI_NAME = 'Chakki Walaa';

const PaymentPage = ({ showToast }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('cod');
  const navigate = useNavigate();

  useEffect(() => {
    const savedOrder = localStorage.getItem('pendingOrder');
    if (!savedOrder) {
      navigate('/cart');
      return;
    }
    try {
      const order = JSON.parse(savedOrder);
      setOrderDetails(order);
    } catch (error) {
      console.error('Error parsing order:', error);
      navigate('/cart');
    }
  }, [navigate]);

  const handlePlaceOrder = async () => {
    if (!orderDetails) {
      if (showToast) showToast('No order details', 'error');
      return;
    }
    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        if (showToast) showToast('Please login first', 'error');
        navigate('/login');
        return;
      }

      const originalAddress = orderDetails.address || {};
      const formattedAddress = {
        recipientName: originalAddress.recipient_name || originalAddress.recipientName || 'Customer',
        recipientMobile: originalAddress.recipient_mobile || originalAddress.recipientMobile || '',
        fullAddress: originalAddress.fullAddress || `${originalAddress.address_line1 || originalAddress.addressLine1 || ''} ${originalAddress.address_line2 || originalAddress.addressLine2 || ''}, ${originalAddress.city || ''}, ${originalAddress.state || ''} - ${originalAddress.pincode || ''}`,
        addressLine1: originalAddress.address_line1 || originalAddress.addressLine1 || '',
        addressLine2: originalAddress.address_line2 || originalAddress.addressLine2 || '',
        city: originalAddress.city || '',
        state: originalAddress.state || '',
        pincode: originalAddress.pincode || '',
        label: originalAddress.label || 'Home'
      };

      const items = (orderDetails.items || []).map(item => ({
        name: item.name || '',
        weight: item.weight || '',
        quantity: item.quantity || 1,
        price: item.price || 0,
        total: (item.price || 0) * (item.quantity || 1)
      }));

      const response = await api.placeOrder(
        formattedAddress,
        orderDetails.deliverySlot,
        selectedMethod,
        items,
        orderDetails.subtotal || 0,
        orderDetails.deliveryFee || 0,
        orderDetails.gst || 0,
        orderDetails.total || 0
      );

      if (response.success && response.orderId) {
        localStorage.removeItem('pendingOrder');
        localStorage.removeItem('cart');
        localStorage.removeItem('selectedSlot');
        localStorage.removeItem('selectedAddress');
        localStorage.removeItem('selectedAddressLabel');
        window.dispatchEvent(new Event('cartUpdated'));
        if (showToast) showToast('Order placed successfully!', 'success');
        navigate(`/order-success?orderId=${response.orderId}`);
      } else {
        if (showToast) showToast(response.error || 'Failed to place order', 'error');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      if (showToast) showToast(error.message || 'Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!orderDetails) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { address, deliverySlot, items, subtotal, deliveryFee, gst, total } = orderDetails;
  const totalItems = items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const displayName = address?.recipient_name || address?.recipientName || 'Customer';
  const displayMobile = address?.recipient_mobile || address?.recipientMobile || '';
  const displayAddress = address?.fullAddress ||
    `${address?.address_line1 || address?.addressLine1 || ''} ${address?.address_line2 || address?.addressLine2 || ''}, ${address?.city || ''}, ${address?.state || ''} - ${address?.pincode || ''}`;

  // Dynamic UPI QR link with exact order amount
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total?.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Chakki Walaa Order Payment')}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment</h1>

        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">Order Summary</h2>

          <div className="mb-4 pb-3 border-b">
            <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-gray-600">{displayAddress}</p>
            <p className="text-sm text-gray-600">📞 {displayMobile}</p>
          </div>

          <div className="mb-4 pb-3 border-b">
            <p className="text-xs text-gray-500 mb-1">Delivery Slot</p>
            <p className="font-medium">{deliverySlot}</p>
          </div>

          <div className="mb-4 pb-3 border-b">
            <p className="text-xs text-gray-500 mb-2">Items ({totalItems})</p>
            {items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm mb-2">
                <span>{item.name} - {item.weight} x {item.quantity}</span>
                <span className="font-medium">₹{(item.price || 0) * (item.quantity || 0)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{subtotal?.toFixed(2) || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee?.toFixed(2) || 0}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST (5%)</span>
              <span>₹{gst?.toFixed(2) || 0}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{total?.toFixed(2) || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3">Choose Payment Method</h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={selectedMethod === 'cod'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-5 h-5 text-primary"
                />
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">Pay when you receive your order</p>
                </div>
              </div>
              <span className="text-2xl">💵</span>
            </label>

            <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="upi"
                  checked={selectedMethod === 'upi'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-5 h-5 text-primary"
                />
                <div>
                  <p className="font-medium">UPI / GPay / PhonePe</p>
                  <p className="text-xs text-gray-500">Pay using any UPI app</p>
                </div>
              </div>
              <span className="text-2xl">📱</span>
            </label>
          </div>

          {selectedMethod === 'upi' && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <p className="font-semibold text-gray-800 mb-1">Scan & Pay</p>
              <p className="text-xs text-gray-500 mb-3">Scan using GPay, PhonePe, Paytm or any UPI app</p>
              
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-white rounded-xl border-2 border-amber-300 inline-block">
                  <QRCode
                    value={upiLink}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#873e23"
                    level="H"
                  />
                </div>
              </div>
              
              <p className="text-lg font-extrabold text-primary">₹{total?.toFixed(2) || 0}</p>
              <p className="text-xs text-gray-500">UPI ID: {UPI_ID}</p>
              <p className="text-xs text-gray-500 mt-2">Amount is pre-filled — just scan and pay!</p>

              {/* UPI Intent Button - opens UPI apps on mobile */}
              <a
                href={upiLink}
                className="mt-3 w-full block bg-#F5DEB3 text-white py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                onClick={(e) => {
                  // On desktop, don't navigate - just show QR
                  if (window.innerWidth > 768) {
                    e.preventDefault();
                    if (showToast) showToast('Please scan the QR code above to pay', 'info');
                  }
                }}
              >
                <span className="text-lg">📱</span>
                Pay ₹{total?.toFixed(2)} with UPI App
              </a>
              <p className="text-xs text-gray-400 mt-1">Opens GPay, PhonePe, Paytm etc on mobile</p>
              
              <div className="mt-3 p-2 bg-yellow-100 rounded-lg">
                <p className="text-xs text-yellow-800 font-medium">⚠️ Complete UPI payment first, then click Confirm Order</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg shadow-lg disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? 'Placing Order...' : selectedMethod === 'upi' ? `Confirm Order ₹${total?.toFixed(2) || 0}` : `Place Order ₹${total?.toFixed(2) || 0}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
