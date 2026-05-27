import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AddressManager = ({ onClose, onAddressSelect, savedAddresses = [] }) => {
  const [addresses, setAddresses] = useState(savedAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const navigate = useNavigate();
  
  // FIXED: Use authToken instead of sessionId
  const authToken = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = !!authToken;

  // If not logged in, show login prompt
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
          <span className="material-symbols-outlined text-5xl text-primary">lock</span>
          <h3 className="text-xl font-bold mt-4">Login Required</h3>
          <p className="text-gray-500 mt-2">Please login to manage your addresses</p>
          <button
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-full font-semibold"
          >
            Login Now →
          </button>
          <button onClick={onClose} className="mt-3 text-gray-500 text-sm block w-full">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await api.getAddresses();
      if (response.success) {
        setAddresses(response.addresses);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const [formData, setFormData] = useState({
    label: 'Home',
    recipientName: user.name || '',
    recipientMobile: user.mobile || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false
  });

  // Get current location and convert to address
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            setFormData(prev => ({
              ...prev,
              addressLine1: addr.road || addr.house_number ? `${addr.house_number || ''} ${addr.road || ''}`.trim() : 'Current Location',
              addressLine2: addr.suburb || addr.neighbourhood || '',
              city: addr.city || addr.town || addr.village || '',
              state: addr.state || '',
              pincode: addr.postcode || '',
              landmark: addr.amenity || addr.shop || ''
            }));
            alert('Location detected! Please review and save.');
          } else {
            alert('Could not get address from location');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          alert(`Location found! Please enter address manually.`);
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setGettingLocation(false);
        alert('Unable to get location. Please enable location access.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const addressData = {
        ...formData,
        addressId: editingAddress?.addressId
      };

      const response = await api.saveAddress(addressData);

      if (response.success) {
        await loadAddresses();
        setShowForm(false);
        setEditingAddress(null);
        setFormData({
          label: 'Home',
          recipientName: user.name || '',
          recipientMobile: user.mobile || '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
          isDefault: addresses.length === 0
        });
        alert('Address saved successfully!');
      } else {
        alert('Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Error saving address');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const response = await api.deleteAddress(addressId);
        if (response.success) {
          await loadAddresses();
          alert('Address deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Error deleting address');
      }
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      recipientName: address.recipientName,
      recipientMobile: address.recipientMobile,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      isDefault: address.isDefault || false
    });
    setShowForm(true);
  };

  const handleSelect = (address) => {
    onAddressSelect(address);
    onClose();
  };

  const defaultAddress = addresses.find(a => a.is_default);
  const additionalAddresses = addresses.filter(a => !a.is_default);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold">Manage Addresses</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4">
          {!showForm ? (
            <>
              {/* Action Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setFormData({
                      label: 'Home',
                      recipientName: user.name || '',
                      recipientMobile: user.mobile || '',
                      addressLine1: '',
                      addressLine2: '',
                      city: '',
                      state: '',
                      pincode: '',
                      landmark: '',
                      isDefault: addresses.length === 0
                    });
                    setShowForm(true);
                  }}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">add_location</span>
                  Add New
                </button>
                <button
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">my_location</span>
                  {gettingLocation ? 'Getting...' : 'Current Location'}
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="material-symbols-outlined text-5xl">location_off</span>
                  <p className="mt-2">No saved addresses</p>
                  <p className="text-sm">Add your first address above</p>
                </div>
              ) : (
                <>
                  {/* Default Address Section */}
                  {defaultAddress && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">star</span>
                        Default Address
                      </h4>
                      <div className="border rounded-xl p-4 bg-primary/5">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold">{defaultAddress.label}</span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>
                            </div>
                            <p className="text-sm font-medium mt-1">{defaultAddress.recipient_name}</p>
                            <p className="text-xs text-gray-500">{defaultAddress.recipient_mobile}</p>
                            <p className="text-xs text-gray-600 mt-2">
                              {defaultAddress.address_line1}, {defaultAddress.address_line2 ? defaultAddress.address_line2 + ', ' : ''}
                              {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                            </p>
                            {defaultAddress.landmark && (
                              <p className="text-xs text-gray-500">Landmark: {defaultAddress.landmark}</p>
                            )}
                          </div>
                          <button onClick={() => handleEdit(defaultAddress)} className="text-blue-600 text-sm">Edit</button>
                        </div>
                        <button
                          onClick={() => handleSelect(defaultAddress)}
                          className="w-full mt-3 bg-primary/10 text-primary py-2 rounded-lg text-sm font-semibold hover:bg-primary/20 transition"
                        >
                          Deliver to this address
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Additional Addresses Section */}
                  {additionalAddresses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">list</span>
                        Additional Addresses
                      </h4>
                      <div className="space-y-3">
                        {additionalAddresses.map(address => {
                          const fullAddress = `${address.address_line1}, ${address.address_line2 ? address.address_line2 + ', ' : ''}${address.city}, ${address.state} - ${address.pincode}`;
                          return (
                            <div key={address.address_id} className="border rounded-xl p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <span className="font-bold">{address.label}</span>
                                  <p className="text-sm font-medium mt-1">{address.recipient_name}</p>
                                  <p className="text-xs text-gray-500">{address.recipient_mobile}</p>
                                  <p className="text-xs text-gray-600 mt-2">{fullAddress}</p>
                                  {address.landmark && (
                                    <p className="text-xs text-gray-500">Landmark: {address.landmark}</p>
                                  )}
                                </div>
                                <div className="flex gap-2 ml-2">
                                  <button onClick={() => handleEdit(address)} className="text-blue-600 text-sm">Edit</button>
                                  <button onClick={() => handleDelete(address.address_id)} className="text-red-600 text-sm">Delete</button>
                                </div>
                              </div>
                              <button
                                onClick={() => handleSelect(address)}
                                className="w-full mt-3 bg-primary/10 text-primary py-2 rounded-lg text-sm font-semibold hover:bg-primary/20 transition"
                              >
                                Deliver to this address
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="font-semibold">{editingAddress ? 'Edit Address' : 'Add New Address'}</h4>

              <div>
                <label className="block text-sm font-medium mb-1">Address Label</label>
                <select name="label" value={formData.label} onChange={handleInputChange} className="w-full p-3 border rounded-xl">
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Recipient Name *</label>
                <input type="text" name="recipientName" value={formData.recipientName} onChange={handleInputChange} required className="w-full p-3 border rounded-xl" placeholder="Full name" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Recipient Mobile *</label>
                <input type="tel" name="recipientMobile" value={formData.recipientMobile} onChange={handleInputChange} required pattern="[0-9]{10}" className="w-full p-3 border rounded-xl" placeholder="10-digit mobile" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} required className="w-full p-3 border rounded-xl" placeholder="House/Flat/Apartment" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address Line 2</label>
                <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="w-full p-3 border rounded-xl" placeholder="Street/Locality (optional)" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">City *</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="w-full p-3 border rounded-xl" /></div>
                <div><label className="block text-sm font-medium mb-1">State *</label><input type="text" name="state" value={formData.state} onChange={handleInputChange} required className="w-full p-3 border rounded-xl" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium mb-1">Pincode *</label><input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required pattern="[0-9]{6}" className="w-full p-3 border rounded-xl" /></div>
                <div><label className="block text-sm font-medium mb-1">Landmark</label><input type="text" name="landmark" value={formData.landmark} onChange={handleInputChange} className="w-full p-3 border rounded-xl" placeholder="Near..." /></div>
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} className="w-4 h-4" />
                <span className="text-sm">Set as default address</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowForm(false); setEditingAddress(null); }} className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50">{loading ? 'Saving...' : 'Save Address'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressManager;
