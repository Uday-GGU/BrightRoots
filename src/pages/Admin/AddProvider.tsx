import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, User, Phone, Mail, Globe, Building } from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';

const cities = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
  'Pune', 'Gurgaon', 'Noida', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

const areas = {
  'Gurgaon': ['Sector 15', 'Sector 22', 'Phase 2', 'DLF City', 'Cyber City', 'Golf Course Road'],
  'Delhi': ['Connaught Place', 'Karol Bagh', 'Lajpat Nagar', 'Saket', 'Dwarka', 'Rohini'],
  'Mumbai': ['Bandra', 'Andheri', 'Powai', 'Thane', 'Navi Mumbai', 'Borivali']
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.businessName || !formData.ownerName || !formData.email || 
        !formData.phone || !formData.city || !formData.area || 
        formData.categories.length === 0) {
      alert('Please fill all required fields and select at least one category');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get existing providers
      const existingProviders = JSON.parse(localStorage.getItem('adminProviders') || '[]');
      
      // Create new provider
      const newProvider = {
        id: Date.now().toString(),
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        website: formData.website,
        description: formData.description,
        city: formData.city,
        area: formData.area,
        pincode: formData.pincode,
        categories: formData.categories,
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0]
      };

      // Add to providers list
      const updatedProviders = [...existingProviders, newProvider];
      localStorage.setItem('adminProviders', JSON.stringify(updatedProviders));

      alert('Provider added successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error adding provider:', error);
      alert('Failed to add provider. Please try again.');
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
                <select
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!formData.city}
                >
                  <option value="">Select Area</option>
                  {formData.city && areas[formData.city as keyof typeof areas]?.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
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