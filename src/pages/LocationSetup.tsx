import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Search, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const cities = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
  'Pune', 'Gurgaon', 'Noida', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

const areas = {
  'Gurgaon': ['Sector 15', 'Sector 22', 'Phase 2', 'DLF City', 'Cyber City', 'Golf Course Road'],
  'Delhi': ['Connaught Place', 'Karol Bagh', 'Lajpat Nagar', 'Saket', 'Dwarka', 'Rohini'],
  'Mumbai': ['Bandra', 'Andheri', 'Powai', 'Thane', 'Navi Mumbai', 'Borivali']
};

export default function LocationSetup() {
  const [method, setMethod] = useState<'auto' | 'manual'>('auto');
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { setUserLocation } = useAuth();
  const navigate = useNavigate();

  const handleAutoDetect = () => {
    setIsDetecting(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Mock reverse geocoding
          setTimeout(() => {
            const mockLocation = {
              city: 'Gurgaon',
              area: 'Sector 15',
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            };
            
            setUserLocation(mockLocation);
            setIsDetecting(false);
            navigate('/home');
          }, 2000);
        },
        (error) => {
          setIsDetecting(false);
          setMethod('manual');
          alert('Unable to detect location. Please select manually.');
        }
      );
    } else {
      setIsDetecting(false);
      setMethod('manual');
      alert('Geolocation is not supported. Please select manually.');
    }
  };

  const handleManualSubmit = () => {
    if (!selectedCity || !selectedArea) {
      alert('Please select both city and area');
      return;
    }

    const location = {
      city: selectedCity,
      area: selectedArea,
      coordinates: {
        lat: 28.4595, // Mock coordinates for Gurgaon
        lng: 77.0266
      }
    };

    setUserLocation(location);
    navigate('/home');
  };

  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            What's your location?
          </h1>
          <p className="text-gray-600">We'll show you the best classes nearby</p>
        </div>

        <Card className="p-6">
          {method === 'auto' ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isDetecting ? (
                    <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                  ) : (
                    <Navigation className="w-8 h-8 text-purple-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {isDetecting ? 'Detecting your location...' : 'Use current location'}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {isDetecting 
                    ? 'Please wait while we find your location'
                    : 'Allow location access for personalized recommendations'
                  }
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleAutoDetect} 
                  disabled={isDetecting}
                  className="w-full"
                  size="lg"
                >
                  {isDetecting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Detect Automatically
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={() => setMethod('manual')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                  disabled={isDetecting}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Enter Manually
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Select your location</h3>
                <p className="text-gray-600 text-sm">Choose your city and area</p>
              </div>

              {/* City Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search City
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type city name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select City
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {filteredCities.map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setSelectedCity(city);
                        setSelectedArea('');
                      }}
                      className={`p-3 text-sm border rounded-lg transition-all ${
                        selectedCity === city
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area Selection */}
              {selectedCity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Area in {selectedCity}
                  </label>
                  {areas[selectedCity as keyof typeof areas] ? (
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                      {areas[selectedCity as keyof typeof areas].map(area => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => setSelectedArea(area)}
                          className={`p-3 text-sm border rounded-lg transition-all text-left ${
                            selectedArea === area
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      placeholder={`Enter area in ${selectedCity}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  )}
                </div>
              )}

              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                  Debug: City="{selectedCity}", Area="{selectedArea}"
                </div>
              )}
              <div className="flex space-x-3">
                <Button
                  onClick={() => setMethod('auto')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleManualSubmit}
                  disabled={!selectedCity || !selectedArea || selectedCity.trim() === '' || selectedArea.trim() === ''}
                  className="flex-1 group"
                >
                  <span>Continue</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}