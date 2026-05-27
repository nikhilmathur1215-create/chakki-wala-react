import React, { useState } from 'react';

const LocationButton = ({ onLocationSelect, showToast }) => {
  const [gettingLocation, setGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      if (showToast) showToast('Geolocation is not supported', 'error');
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
            const fullAddress = `${addr.road || ''}, ${addr.city || addr.town || ''}, ${addr.state || ''} - ${addr.postcode || ''}`;
            onLocationSelect(fullAddress);
            if (showToast) showToast('Location detected!', 'success');
          } else {
            if (showToast) showToast('Could not get address', 'error');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          if (showToast) showToast('Error getting location', 'error');
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setGettingLocation(false);
        if (showToast) showToast('Unable to get location', 'error');
      }
    );
  };

  return (
    <button
      onClick={getCurrentLocation}
      disabled={gettingLocation}
      className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/20 transition-all"
    >
      <span className="material-symbols-outlined text-base">my_location</span>
      {gettingLocation ? 'Getting...' : 'Use Current Location'}
    </button>
  );
};

export default LocationButton;
