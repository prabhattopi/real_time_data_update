import { useState } from 'react';

const LocationForm=({ userId, socket }) => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [visibility, setVisibility] = useState('public');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Send via WebSocket for real-time updates
      socket.emit('locationUpdate', {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        visibility
      });

      setLatitude('');
      setLongitude('');
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="location-form">
      <div className="form-group">
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          required
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <select 
          value={visibility} 
          onChange={(e) => setVisibility(e.target.value)}
          className="visibility-select"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <button type="submit" className="submit-button">
          📍 Submit Location
        </button>
      </div>
    </form>
  );
};

export default LocationForm;