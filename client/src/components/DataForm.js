import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import axios from 'axios';
import './DataForm.css';

function DataForm({ onShopAdded, apiKey }) {
  const [formData, setFormData] = useState({
    shopName: '',
    placeName: '',
    latitude: '',
    longitude: '',
    googleMapsLink: '',
    route: '',
    storeType: '',
  });

  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setFormData(prev => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
            googleMapsLink: `https://www.google.com/maps?q=${lat},${lng}`,
          }));

          // Get place name from coordinates
          try {
            const response = await axios.post('/api/location/geocode', {
              latitude: lat,
              longitude: lng,
            });

            if (response.data.success) {
              setFormData(prev => ({
                ...prev,
                placeName: response.data.placeName,
              }));
            }
          } catch (error) {
            console.error('Error geocoding:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        processImage(blob);
        stopCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      processImage(file);
    }
  };

  const processImage = async (imageBlob) => {
    setIsProcessing(true);

    try {
      // Perform OCR using Tesseract.js
      const result = await Tesseract.recognize(imageBlob, 'eng+ara', {
        logger: (m) => console.log(m),
      });

      const extractedText = result.data.text.trim();
      console.log('Extracted text:', extractedText);

      // Try to extract shop name (first line or most prominent text)
      const lines = extractedText.split('\n').filter(line => line.trim().length > 0);
      const shopName = lines[0] || extractedText.substring(0, 50);

      setFormData(prev => ({
        ...prev,
        shopName: shopName,
      }));

      // Upload image to server
      const formDataUpload = new FormData();
      formDataUpload.append('image', imageBlob);

      const uploadResponse = await axios.post('/api/ocr/process', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Image uploaded:', uploadResponse.data);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.shopName || !formData.route || !formData.storeType) {
      alert('Please fill in Shop Name, Route, and Store Type.');
      return;
    }

    setIsSaving(true);

    try {
      await axios.post('/api/sheets/add', {
        shopName: formData.shopName,
        placeName: formData.placeName,
        latitude: formData.latitude,
        longitude: formData.longitude,
        googleMapsLink: formData.googleMapsLink,
        route: formData.route,
        storeType: formData.storeType,
        photoUrl: capturedImage || '',
      });

      alert('Shop data saved successfully!');

      // Reset form
      setFormData({
        shopName: '',
        placeName: '',
        latitude: '',
        longitude: '',
        googleMapsLink: '',
        route: '',
        storeType: '',
      });
      setCapturedImage(null);

      // Get new location for next entry
      getCurrentLocation();

      // Notify parent component
      onShopAdded();
    } catch (error) {
      console.error('Error saving shop:', error);
      alert('Error saving shop data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="data-form-container">
      <h2>Add New Shop</h2>

      {/* Camera Section */}
      <div className="camera-section">
        {!showCamera && !capturedImage && (
          <div className="camera-buttons">
            <button
              type="button"
              className="btn-camera"
              onClick={startCamera}
            >
              📷 Open Camera
            </button>
            <button
              type="button"
              className="btn-upload"
              onClick={() => fileInputRef.current?.click()}
            >
              📁 Upload Image
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>
        )}

        {showCamera && (
          <div className="camera-view">
            <video ref={videoRef} autoPlay playsInline />
            <div className="camera-controls">
              <button
                type="button"
                className="btn-capture"
                onClick={capturePhoto}
              >
                Capture Photo
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={stopCamera}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="captured-image">
            <img src={capturedImage} alt="Captured shop" />
            <button
              type="button"
              className="btn-retake"
              onClick={() => {
                setCapturedImage(null);
                setFormData(prev => ({ ...prev, shopName: '' }));
              }}
            >
              Retake Photo
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="processing-overlay">
            <div className="spinner"></div>
            <p>Processing image and extracting text...</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="shop-form">
        {/* Shop Name */}
        <div className="form-group">
          <label htmlFor="shopName">Shop Name *</label>
          <input
            type="text"
            id="shopName"
            name="shopName"
            value={formData.shopName}
            onChange={handleInputChange}
            placeholder="Auto-filled from photo"
            required
          />
        </div>

        {/* Place Name */}
        <div className="form-group">
          <label htmlFor="placeName">Place Name</label>
          <input
            type="text"
            id="placeName"
            name="placeName"
            value={formData.placeName}
            onChange={handleInputChange}
            placeholder="Auto-filled from location"
            readOnly
          />
        </div>

        {/* Location Details */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              type="text"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              placeholder="Auto-filled"
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="text"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              placeholder="Auto-filled"
              readOnly
            />
          </div>
        </div>

        {/* Google Maps Link */}
        <div className="form-group">
          <label htmlFor="googleMapsLink">Google Maps Link</label>
          <input
            type="url"
            id="googleMapsLink"
            name="googleMapsLink"
            value={formData.googleMapsLink}
            onChange={handleInputChange}
            placeholder="Auto-filled"
            readOnly
          />
        </div>

        {/* Route Selection */}
        <div className="form-group">
          <label>Sales Route *</label>
          <div className="route-buttons">
            <button
              type="button"
              className={`route-btn route-1 ${formData.route === 'Route 1' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, route: 'Route 1' }))}
            >
              Route 1
            </button>
            <button
              type="button"
              className={`route-btn route-2 ${formData.route === 'Route 2' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, route: 'Route 2' }))}
            >
              Route 2
            </button>
            <button
              type="button"
              className={`route-btn route-3 ${formData.route === 'Route 3' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, route: 'Route 3' }))}
            >
              Route 3
            </button>
            <button
              type="button"
              className={`route-btn route-4 ${formData.route === 'Route 4' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, route: 'Route 4' }))}
            >
              Route 4
            </button>
          </div>
        </div>

        {/* Store Type */}
        <div className="form-group">
          <label>Store Type *</label>
          <div className="store-type-buttons">
            <button
              type="button"
              className={`type-btn ${formData.storeType === 'With Supervisor' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, storeType: 'With Supervisor' }))}
            >
              With Supervisor
            </button>
            <button
              type="button"
              className={`type-btn ${formData.storeType === 'Without Supervisor' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, storeType: 'Without Supervisor' }))}
            >
              Without Supervisor
            </button>
            <button
              type="button"
              className={`type-btn ${formData.storeType === 'Discount Store' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, storeType: 'Discount Store' }))}
            >
              Discount Store
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-submit"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Shop Data'}
        </button>
      </form>
    </div>
  );
}

export default DataForm;
