import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProfilePage = ({ showToast }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const loadProfile = useCallback(async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.getProfile();
      if (response.success && response.user) {
        setUser(response.user);
        setName(response.user.name || '');
        setEmail(response.user.email || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdateProfile = async () => {
    try {
      const response = await api.updateProfile(name, email);
      if (response.success) {
        setUser(prev => ({ ...prev, name: name, email: email }));
        setEditing(false);
        if (showToast) showToast('Profile updated successfully', 'success');
      } else {
        if (showToast) showToast(response.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (showToast) showToast('Failed to update profile', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('verifyMobile');
      localStorage.removeItem('cart');
      localStorage.removeItem('pendingOrder');
      localStorage.removeItem('selectedAddress');
      localStorage.removeItem('selectedAddressLabel');
      localStorage.removeItem('selectedSlot');
      window.dispatchEvent(new Event('cartUpdated'));
      if (showToast) showToast('Logged out successfully', 'success');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-400">person_off</span>
        <p className="text-gray-500 mt-4">Please login to view profile</p>
        <button onClick={() => navigate('/login')} className="mt-4 bg-primary text-white px-6 py-2 rounded-full">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-32">
      <h2 className="text-xl font-bold mb-4">My Profile</h2>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-4 text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-5xl text-primary">account_circle</span>
        </div>
        <h3 className="text-xl font-bold mt-3">{user.name || user.mobile || 'User'}</h3>
        <p className="text-gray-500">+91 {user.mobile}</p>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Personal Information</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-primary text-sm font-semibold">
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-xl focus:ring-primary focus:border-primary"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-xl focus:ring-primary focus:border-primary"
                placeholder="your@email.com"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setEditing(false);
                  setName(user.name || '');
                  setEmail(user.email || '');
                }}
                className="flex-1 bg-gray-100 py-2 rounded-full font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 bg-primary text-white py-2 rounded-full font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Mobile Number</span>
              <span className="font-medium">{user.mobile}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">{user.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{user.email || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Member Since</span>
              <span className="font-medium">{user.registered_at ? new Date(user.registered_at).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
        <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
        <div className="text-center py-2">
          <p className="text-3xl font-bold text-primary">{user.total_orders || 0}</p>
          <p className="text-sm text-gray-500">Total Orders</p>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="w-full mt-3 bg-primary/10 text-primary py-2 rounded-full font-semibold"
        >
          View Order History →
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-red-500 text-white py-3 rounded-full font-semibold mt-4 active:scale-95 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default ProfilePage;