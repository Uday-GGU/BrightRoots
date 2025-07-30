import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Phone, Navigation, Search, ArrowRight, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ProviderService } from '../../services/providerService';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';

const cities = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
  'Pune', 'Gurgaon', 'Noida', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

const areas = {
  'Gurgaon': ['Sector 15', 'Sector 22', 'Phase 2', 'DLF City', 'Cyber City', 'Golf Course Road'],
  'Delhi': ['Connaught Place', 'Karol Bagh', 'Lajpat Nagar', 'Saket', 'Dwarka', 'Rohini'],
  'Mumbai': ['Bandra', 'Andheri', 'Powai', 'Thane', 'Navi Mumbai', 'Borivali'],
  'Bangalore': ['Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'HSR Layout', 'Marathahalli'],
  'Hyderabad': ['Hitech City', 'Banjara Hills', 'Jubilee Hills', 'Kondapur', 'Gachibowli', 'Secunderabad'],
  'Chennai': ['T Nagar', 'Anna Nagar', 'Velachery', 'Adyar', 'Tambaram', 'OMR']
};

export default function SimpleOnboarding() {
  const { user, supabaseUser } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    area: '',
    pincode: '',
    latitude: null as number | null,
    longitude: null as number | null,
    bio: ''
  });

  // Check if user should be here
  useEffect(() => {
    if (!user || user.role !== 'provider') {
      navigate('/provider/login');
      return;
    }

    // Check if provider profile already exists
    checkExistingProvider();
  }, [user, navigate]);

  const checkExistingProvider = async () => {
    if (!supabaseUser?.id) return;

    try {
      const existingProvider = await ProviderService.getProviderByUserId(supabaseUser.id);
      if (existingProvider) {
        // Provider already exists, redirect to dashboard
        navigate('/provider/dashboard');
      }
    } catch (error) {
      // Provider doesn't exist, continue with onboarding
      console.log('No existing provider found, continuing with onboarding');
    }
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Mock reverse geocoding (in real app, use Google Maps API)
      setFormData(prev => ({
        ...prev,
        city: 'Gurgaon',
        area: 'Sector 15',
        pincode: '122001',
        latitude,
        longitude
      }));

      showSuccess('Location Detected', 'Location detected successfully!');
    } catch (error) {
      console.error('Error detecting location:', error);
      showError('Location Error', 'Could not detect location. Please enter manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.city || !formData.area || !formData.pincode) {
      showError('Missing Information', 'Please fill all required fields');
      return;
    }

    if (!supabaseUser) {
      showError('Authentication Error', 'User not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create provider record
      const providerData = {
        user_id: supabaseUser.id,
        business_name: `${user?.name || 'Provider'}'s Classes`,
        owner_name: user?.name || 'Provider',
        email: supabaseUser.email || '',
        phone: formData.phone,
        description: formData.bio || 'Professional education services',
        address: `${formData.area}, ${formData.city}`,
        city: formData.city,
        area: formData.area,
        pincode: formData.pincode,
        latitude: formData.latitude || 28.4595, // Default to Gurgaon
        longitude: formData.longitude || 77.0266,
        status: 'pending' as const
      };

      await ProviderService.createProvider(providerData);

      showSuccess('Profile Created', 'Your provider profile has been created successfully!');
      navigate('/provider/dashboard');
    } catch (error) {
      console.error('Error creating provider:', error);
      showError('Profile Creation Failed', 'Failed to create provider profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">Set up your provider profile to start offering classes</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
              
              {/* Auto-detect button */}
              <div className="mb-4">
                <Button
                  type="button"
                  onClick={handleAutoDetect}
                  disabled={isDetecting}
                  variant="outline"
                  className="w-full"
                >
                  {isDetecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Detecting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Auto-Detect Location
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, city: e.target.value, area: '' }));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area *
                  </label>
                  {formData.city && areas[formData.city as keyof typeof areas] ? (
                    <select
                      value={formData.area}
                      onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Area</option>
                      {areas[formData.city as keyof typeof areas].map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                      placeholder={formData.city ? `Enter area in ${formData.city}` : "Select city first"}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!formData.city}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pin Code *
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    placeholder="Enter 6-digit pin code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your full address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About You</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  placeholder="Tell parents about your teaching experience and expertise..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Coordinates Display */}
            {(formData.latitude && formData.longitude) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Location Coordinates</p>
                    <p className="text-sm text-green-700">
                      Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full group"
              size="lg"
            >
              <span>
                {isSubmitting ? 'Creating Profile...' : 'Complete Profile Setup'}
              </span>
              {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}