import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, User, Phone, Mail, Globe, Building } from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import { ProviderService } from '../../services/providerService';
import { supabaseAdmin } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';

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
  'Chennai': ['T Nagar', 'Anna Nagar', 'Velachery', 'Adyar', 'Tambaram', 'OMR'],
  'Kolkata': ['Salt Lake', 'Park Street', 'Ballygunge', 'New Town', 'Howrah', 'Rajarhat'],
  'Pune': ['Koregaon Park', 'Hinjewadi', 'Baner', 'Wakad', 'Kothrud', 'Viman Nagar'],
  'Noida': ['Sector 62', 'Sector 18', 'Sector 137', 'Greater Noida', 'Sector 76', 'Sector 135'],
  'Ahmedabad': ['Satellite', 'Vastrapur', 'Bopal', 'Prahlad Nagar', 'Maninagar', 'Navrangpura'],
  'Jaipur': ['Malviya Nagar', 'Vaishali Nagar', 'C Scheme', 'Mansarovar', 'Jagatpura', 'Tonk Road'],
  'Lucknow': ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Mahanagar', 'Alambagh']
};

const serviceCategories = [
  { id: 'tuition', name: 'Academic Tuitions', icon: '📚' },
  { id: 'music', name: 'Music Classes', icon: '🎵' },
  { id: 'dance', name: 'Dance Classes', icon: '💃' },
  { id: 'sports', name: 'Sports Training', icon: '⚽' },
  { id: 'coding', name: 'Coding / STEM', icon: '💻' },
  { id: 'art', name: 'Art & Craft', icon: '🎨' },
  { id: 'daycare', name: 'Daycare / After-school', icon: '🏠' },
  { id: 'camps', name: 'Summer Camps', icon: '🏕️' }
];

export default function AddProvider() {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationMethod, setLocationMethod] = useState<'auto' | 'manual'>('manual');
  const [isDetecting, setIsDetecting] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    description: '',
    city: '',
    area: '',
    pincode: '',
    categories: [] as string[],
    status: 'approved' as 'pending' | 'approved' | 'rejected'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        showError('Geolocation Error', 'Geolocation is not supported by this browser');
        return;
      }

      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Mock reverse geocoding (in real app, use Google Maps API or similar)
      // For demo, we'll set some default values
      setFormData(prev => ({
        ...prev,
        city: 'Gurgaon',
        area: 'Sector 15',
        pincode: '122001'
      }));

      showSuccess('Location Detected', 'Location detected successfully! Demo values filled.');
    } catch (error) {
      console.error('Error detecting location:', error);
      showError('Location Error', 'Could not detect location. Please enter manually.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.businessName || !formData.ownerName || !formData.email || 
        !formData.phone || !formData.city || !formData.area || 
        formData.categories.length === 0) {
      showError('Missing Information', 'Please fill all required fields and select at least one category');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 Creating new provider...', formData);
      
      // Create provider directly without auth user (admin-created providers)
      const providerData = {
        user_id: null, // Admin-created providers don't have auth users initially
        business_name: formData.businessName,
        owner_name: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        website: formData.website,
        description: formData.description,
        address: `${formData.area}, ${formData.city}`,
        city: formData.city,
        area: formData.area,
        pincode: formData.pincode,
        status: formData.status,
        is_published: formData.status === 'approved', // Auto-publish if approved
        latitude: 28.4595, // Mock coordinates
        longitude: 77.0266
      };

      console.log('📝 Creating provider with data:', providerData);
      const newProvider = await ProviderService.createProvider(providerData);
      console.log('✅ Provider created:', newProvider);
      
      // Add services
      if (formData.categories.length > 0) {
        console.log('📝 Adding services:', formData.categories);
        await ProviderService.addProviderServices(newProvider.id, formData.categories);
        console.log('✅ Services added:', formData.categories);
      }
      
      // Create a sample class for each category
      for (const category of formData.categories) {
        console.log('📝 Creating class for category:', category);
        await ProviderService.createClass({
          provider_id: newProvider.id,
          name: `${category.charAt(0).toUpperCase() + category.slice(1)} Classes`,
          description: `Professional ${category} training and education`,
          category: category,
          age_group: '6-16 years',
          mode: 'offline',
          duration: '60 minutes',
          price: 1500,
          fee_type: 'per_session',
          schedule: { timings: ['Mon 4-5 PM', 'Wed 4-5 PM', 'Sat 10-11 AM'] }
        });
      }
      console.log('✅ Sample classes created');

      showSuccess('Provider Added', 'Provider has been added successfully and is now live!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error adding provider:', error);
      showError('Failed to Add Provider', error?.message || 'Unknown error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 -ml-2 mr-4 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Provider</h1>
              <p className="text-gray-600">Create a new education provider profile</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Building className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="e.g., Harmony Music Academy"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name *
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  placeholder="Full name of the owner"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                placeholder="Brief description of services offered..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </Card>

          {/* Location Information */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <MapPin className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Location Information</h2>
            </div>
            
            {/* Location Method Selection */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setLocationMethod('auto')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    locationMethod === 'auto'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>🌍</span>
                  <span>Auto Detect</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMethod('manual')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    locationMethod === 'manual'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span>✏️</span>
                  <span>Enter Manually</span>
                </button>
              </div>

              {locationMethod === 'auto' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleAutoDetect}
                      disabled={isDetecting}
                      className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all ${
                        isDetecting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isDetecting ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Detecting Location...
                        </>
                      ) : (
                        'Detect Current Location'
                      )}
                    </button>
                    <p className="text-sm text-blue-600 mt-2">
                      Click to automatically fill location details
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => {
                    handleInputChange('city', e.target.value);
                    handleInputChange('area', ''); // Reset area when city changes
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
                  <div className="space-y-2">
                    <select
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Area</option>
                      {areas[formData.city as keyof typeof areas].map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    <div className="text-center text-sm text-gray-500">or</div>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      placeholder="Type area name manually"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    placeholder={formData.city ? `Enter area in ${formData.city}` : "Select city first"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={!formData.city}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pin Code
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={6}
                />
              </div>
            </div>
          </Card>

          {/* Service Categories */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Service Categories *</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {serviceCategories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`p-4 border-2 rounded-xl transition-all text-left ${
                    formData.categories.includes(category.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="font-medium text-sm">{category.name}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Status */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Provider Status</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {(['pending', 'approved', 'rejected'] as const).map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleInputChange('status', status)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.status === status
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium capitalize">{status}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Adding Provider...' : 'Add Provider'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}