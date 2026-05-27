import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OrderSuccessPage = ({ showToast }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      navigate('/orders');
    }
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-4">Thank you for your order</p>
        <p className="text-sm text-gray-400 mb-8">Order ID: {orderId}</p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-primary text-white px-8 py-3 rounded-full font-semibold"
        >
          View My Orders
        </button>
        <button
          onClick={() => navigate('/')}
          className="block mt-4 text-primary"
        >
          Continue Shopping →
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;