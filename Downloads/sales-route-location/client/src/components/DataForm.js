import React, { useState, useRef, useEffect } from 'react';
import './DataForm.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const DataForm = ({ onShopAdded }) => {
  const [formData, setFormData] = useState({
    shopName: '',
    placeName: '',
    latitude: '',
    longitude: '',
    googleMapsLink: '',
    route: '',
    storeType: '',
    phoneNumber: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [processingOCR, setProcessingOCR] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
    
    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Get current GPS location
  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setFormData(prev => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
            googleMapsLink: `https://maps.google.com/?q=${lat},${lng}`
          }));

          // Get place name from coordinates
          try {
            const response = await axios.post('/api/location/geocode', { lat, lng });
            if (response.data.success) {
              setFormData(prev => ({
                ...prev,
                placeName: response.data.placeName
              }));
            }
          } catch (error) {
            console.error('Error getting place name:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.warning('Could not get your location. Please enter manually.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please use file upload instead.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        processImage(file);
        setCapturedImage(URL.createObjectURL(blob));
        stopCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      processImage(file);
      setCapturedImage(URL.createObjectURL(file));
    }
  };

  // Process image with OCR
  const processImage = async (file) => {
    setProcessingOCR(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/ocr/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          shopName: response.data.shopName || prev.shopName
        }));
        
        if (response.data.confidence > 70) {
          toast.success('Text extracted successfully!');
        } else {
          toast.warning('Text extracted with low confidence. Please verify.');
        }
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to process image. Please enter shop name manually.');
    } finally {
      setProcessingOCR(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle route selection
  const handleRouteSelect = (route) => {
    setFormData(prev => ({
      ...prev,
      route: route
    }));
  };

  // Handle store type selection
  const handleStoreTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      storeType: type
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.shopName || !formData.latitude || !formData.longitude || !formData.route || !formData.storeType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/sheets/add', formData);
      
      if (response.data.success) {
        toast.success('Shop data saved successfully!');
        
        // Reset form
        setFormData({
          shopName: '',
          placeName: '',
          latitude: '',
          longitude: '',
          googleMapsLink: '',
          route: '',
          storeType: '',
          phoneNumber: '',
          notes: ''
        });
        setCapturedImage(null);
        
        // Get new location for next entry
        getCurrentLocation();
        
        // Notify parent component
        if (onShopAdded) {
          onShopAdded(response.data.data);
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save shop data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-form-container">
      <h2>📝 Add New Shop</h2>
      
      {/* Camera Section */}
      <div className="camera-section">
        <h3>📷 Capture Shop Nameplate</h3>
        
        {!cameraActive && !capturedImage && (
          <div className="camera-buttons">
            <button type="button" onClick={startCamera} className="camera-btn">
              📷 Open Camera
            </button>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="upload-btn"
            >
              📁 Upload Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {cameraActive && (
          <div className="camera-view">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="video-stream"
            />
            <div className="camera-controls">
              <button onClick={capturePhoto} className="capture-btn">
                📸 Capture
              </button>
              <button onClick={stopCamera} className="cancel-btn">
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="captured-image">
            <img src={capturedImage} alt="Captured shop" />
            <button 
              onClick={() => {
                setCapturedImage(null);
                setFormData(prev => ({ ...prev, shopName: '' }));
              }} 
              className="retake-btn"
            >
              🔄 Retake Photo
            </button>
          </div>
        )}

        {processingOCR && (
          <div className="ocr-processing">
            <div className="spinner"></div>
            <p>Extracting text from image...</p>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="shop-form">
        <div className="form-group">
          <label htmlFor="shopName">Shop Name *</label>
          <input
            type="text"
            id="shopName"
            name="shopName"
            value={formData.shopName}
            onChange={handleInputChange}
            placeholder="Enter shop name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="placeName">Place Name</label>
          <input
            type="text"
            id="placeName"
            name="placeName"
            value={formData.placeName}
            onChange={handleInputChange}
            placeholder="Auto-detected from GPS"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude">Latitude *</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              placeholder="e.g., 25.3792"
              step="0.000001"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="longitude">Longitude *</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              placeholder="e.g., 49.5818"
              step="0.000001"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="googleMapsLink">Google Maps Link</label>
          <input
            type="url"
            id="googleMapsLink"
            name="googleMapsLink"
            value={formData.googleMapsLink}
            onChange={handleInputChange}
            placeholder="Auto-generated from coordinates"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="e.g., +966 5x xxx xxxx"
          />
        </div>

        <div className="form-group">
          <label>Select Route *</label>
          <div className="route-buttons">
            {['Route 1', 'Route 2', 'Route 3', 'Route 4'].map((route, index) => (
              <button
                key={route}
                type="button"
                className={`route-btn route-${index + 1} ${formData.route === route ? 'selected' : ''}`}
                onClick={() => handleRouteSelect(route)}
              >
                {route}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Store Type *</label>
          <div className="store-type-buttons">
            {['With Supervisor', 'Without Supervisor', 'Discount Store'].map(type => (
              <button
                key={type}
                type="button"
                className={`store-type-btn ${formData.storeType === type ? 'selected' : ''}`}
                onClick={() => handleStoreTypeSelect(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Additional information about the shop"
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={getCurrentLocation} 
            className="location-btn"
          >
            📍 Refresh Location
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || processingOCR}
          >
            {loading ? 'Saving...' : '💾 Save Shop Data'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataForm;
