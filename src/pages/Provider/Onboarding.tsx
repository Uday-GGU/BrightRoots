import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, User, BookOpen, Clock, Camera, FileText, 
  ArrowRight, ArrowLeft, CheckCircle, Navigation, Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProvider } from '../../hooks/useProvider';
import { ProviderService } from '../../services/providerService';
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

const ageGroups = ['3-5 years', '6-8 years', '9-12 years', '13-16 years', '16+ years'];
const timings = ['Morning (6-12 PM)', 'Afternoon (12-6 PM)', 'Evening (6-10 PM)', 'Flexible'];

export default function ProviderOnboarding() {
  const { user, supabaseUser } = useAuth();
  const { provider, createProvider } = useProvider();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location state
  const [locationMethod, setLocationMethod] = useState<'auto' | 'manual'>('auto');
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Business info state
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    ownerName: supabaseUser?.user_metadata?.name || '',
    phone: '',
    whatsapp: '',
    email: supabaseUser?.email || '',
    website: ''
  });

  // Services state
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Class details state
  const [classDetails, setClassDetails] = useState({
    type: 'offline' as 'online' | 'offline' | 'hybrid',
    ageGroups: [] as string[],
    timings: [] as string[],
    duration: '',
    feeStructure: {
      type: 'per_session' as 'per_session' | 'monthly',
      amount: 0
    }
  });

  const totalSteps = 7;

  // Check if provider already exists
  useEffect(() => {
    if (provider) {
      // Provider already exists, redirect to dashboard
      navigate('/provider/dashboard');
    }
  }, [provider, navigate]);
  const handleAutoDetect = () => {
    setIsDetecting(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            const mockLocation = {
              city: 'Gurgaon',
              area: 'Sector 15',
              pincode: '122001',
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            };
            
            setSelectedCity(mockLocation.city);
            setSelectedArea(mockLocation.area);
            setPincode(mockLocation.pincode);
            setIsDetecting(false);
            setCurrentStep(2);
          }, 2000);
        },
        (error) => {
          setIsDetecting(false);
          setLocationMethod('manual');
          alert('Unable to detect location. Please select manually.');
        }
      );
    } else {
      setIsDetecting(false);
      setLocationMethod('manual');
      alert('Geolocation is not supported. Please select manually.');
    }
  };

  const handleManualLocation = () => {
    if (!selectedCity || !selectedArea || !pincode) {
      alert('Please fill all location fields');
      return;
    }

    setCurrentStep(2);
  };

  const handleBusinessInfo = () => {
    if (!businessInfo.businessName || !businessInfo.ownerName || !businessInfo.phone || !businessInfo.email) {
      alert('Please fill all required fields');
      return;
    }

    setCurrentStep(3);
  };

  const handleServices = () => {
    if (selectedServices.length === 0) {
      alert('Please select at least one service category');
      return;
    }

    setCurrentStep(4);
  };

  const handleClassDetails = () => {
    if (!classDetails.duration || classDetails.ageGroups.length === 0 || classDetails.timings.length === 0 || classDetails.feeStructure.amount === 0) {
      alert('Please fill all class details');
      return;
    }

    setCurrentStep(5);
  };

  const handleSubmit = async () => {
    if (!supabaseUser) {
      alert('Authentication required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create provider record
      const providerData = {
        user_id: supabaseUser.id,
        business_name: businessInfo.businessName,
        owner_name: businessInfo.ownerName,
        email: businessInfo.email,
        phone: businessInfo.phone,
        whatsapp: businessInfo.whatsapp || null,
        website: businessInfo.website || null,
        description: `Professional ${selectedServices.join(', ')} services`,
        address: `${selectedArea}, ${selectedCity}`,
        city: selectedCity,
        area: selectedArea,
        pincode: pincode,
        latitude: 28.4595, // Mock coordinates
        longitude: 77.0266,
        status: 'pending' as const
      };

      const newProvider = await createProvider(providerData);

      // Add services
      await ProviderService.addProviderServices(newProvider.id, selectedServices);

      // Create a sample class
      if (classDetails.ageGroups.length > 0) {
        await ProviderService.createClass({
          provider_id: newProvider.id,
          name: `${selectedServices[0]} Classes`,
          description: `Professional ${selectedServices[0]} training`,
          category: selectedServices[0],
          age_group: classDetails.ageGroups[0],
          mode: classDetails.type,
          duration: classDetails.duration,
          price: classDetails.feeStructure.amount,
          fee_type: classDetails.feeStructure.type,
          schedule: classDetails.timings.map(timing => ({ timing }))
        });
      }

      alert('Application submitted successfully! We will review and approve your profile within 24-48 hours.');
      navigate('/provider/dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Location</h2>
              <p className="text-gray-600">Where do you provide your services?</p>
            </div>

            {locationMethod === 'auto' ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {isDetecting ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    ) : (
                      <Navigation className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {isDetecting ? 'Detecting your location...' : 'Use current location'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {isDetecting 
                      ? 'Please wait while we find your location'
                      : 'Allow location access for quick setup'
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
                    {isDetecting ? 'Detecting...' : 'Detect Automatically'}
                  </Button>
                  
                  <Button 
                    onClick={() => setLocationMethod('manual')}
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={isDetecting}
                  >
                    Enter Manually
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

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
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedCity && areas[selectedCity as keyof typeof areas] && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Area in {selectedCity}
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                      {areas[selectedCity as keyof typeof areas].map(area => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => setSelectedArea(area)}
                          className={`p-3 text-sm border rounded-lg transition-all text-left ${
                            selectedArea === area
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pin Code
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit pin code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={6}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => setLocationMethod('auto')}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleManualLocation}
                    disabled={!selectedCity || !selectedArea || !pincode}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
              <p className="text-gray-600">Tell us about your educational services</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business/Provider Name *
                </label>
                <input
                  type="text"
                  value={businessInfo.businessName}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="e.g., Harmony Music Academy"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name *
                </label>
                <input
                  type="text"
                  value={businessInfo.ownerName}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, ownerName: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Your contact number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number (Optional)
                </label>
                <input
                  type="tel"
                  value={businessInfo.whatsapp}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="WhatsApp number for enquiries"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website/Social Link (Optional)
                </label>
                <input
                  type="url"
                  value={businessInfo.website}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://your-website.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleBusinessInfo}
                className="flex-1"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Services</h2>
              <p className="text-gray-600">What educational services do you provide?</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {serviceCategories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedServices(prev => 
                      prev.includes(category.id)
                        ? prev.filter(id => id !== category.id)
                        : [...prev, category.id]
                    );
                  }}
                  className={`p-4 border-2 rounded-xl transition-all text-left ${
                    selectedServices.includes(category.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="font-medium text-sm">{category.name}</div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleServices}
                disabled={selectedServices.length === 0}
                className="flex-1"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Class Details</h2>
              <p className="text-gray-600">Provide details about your classes</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Class Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['online', 'offline', 'hybrid'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setClassDetails(prev => ({ ...prev, type }))}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        classDetails.type === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium capitalize">{type}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Age Groups Served *
                </label>
                <div className="space-y-2">
                  {ageGroups.map(age => (
                    <label key={age} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={classDetails.ageGroups.includes(age)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setClassDetails(prev => ({ 
                              ...prev, 
                              ageGroups: [...prev.ageGroups, age] 
                            }));
                          } else {
                            setClassDetails(prev => ({ 
                              ...prev, 
                              ageGroups: prev.ageGroups.filter(a => a !== age) 
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{age}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Available Timings *
                </label>
                <div className="space-y-2">
                  {timings.map(timing => (
                    <label key={timing} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={classDetails.timings.includes(timing)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setClassDetails(prev => ({ 
                              ...prev, 
                              timings: [...prev.timings, timing] 
                            }));
                          } else {
                            setClassDetails(prev => ({ 
                              ...prev, 
                              timings: prev.timings.filter(t => t !== timing) 
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{timing}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Duration *
                </label>
                <input
                  type="text"
                  value={classDetails.duration}
                  onChange={(e) => setClassDetails(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 45 minutes, 1 hour"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Fee Structure *
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {(['per_session', 'monthly'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setClassDetails(prev => ({ 
                        ...prev, 
                        feeStructure: { ...prev.feeStructure, type } 
                      }))}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        classDetails.feeStructure.type === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">
                        {type === 'per_session' ? 'Per Session' : 'Monthly'}
                      </div>
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={classDetails.feeStructure.amount}
                  onChange={(e) => setClassDetails(prev => ({ 
                    ...prev, 
                    feeStructure: { ...prev.feeStructure, amount: parseInt(e.target.value) || 0 } 
                  }))}
                  placeholder="Enter amount in ₹"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentStep(3)}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleClassDetails}
                className="flex-1"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Camera className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Media</h2>
              <p className="text-gray-600">Add photos to showcase your services</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Picture/Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload profile image</p>
                  <p className="text-xs text-gray-500 mt-1">Recommended: Square image, max 2MB</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cover Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload cover image</p>
                  <p className="text-xs text-gray-500 mt-1">Recommended: 16:9 ratio, max 5MB</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gallery (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload photos of your classes/setup</p>
                  <p className="text-xs text-gray-500 mt-1">Multiple images allowed, max 2MB each</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="YouTube or Instagram reel URL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentStep(4)}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(6)}
                className="flex-1"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents & Verification</h2>
              <p className="text-gray-600">Upload documents for verification</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  PAN Card *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload PAN card image</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Aadhaar Card *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload Aadhaar card image</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Business Registration (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload business registration certificate</p>
                  <p className="text-xs text-gray-500 mt-1">For verified business tag</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Qualification Certificates (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload teaching/professional certificates</p>
                  <p className="text-xs text-gray-500 mt-1">Multiple files allowed</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="terms" className="ml-3 text-sm text-blue-900">
                    I agree to the <a href="#" className="underline">Terms & Conditions</a> and <a href="#" className="underline">Privacy Policy</a>. I confirm that all information provided is accurate and I have the right to offer these educational services.
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentStep(5)}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(7)}
                className="flex-1"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
              <p className="text-gray-600">Please review your information before submitting</p>
            </div>

            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-sm text-gray-600">
                  {selectedArea}, {selectedCity} - {pincode}
                </p>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Business Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Business:</strong> {businessInfo.businessName}</p>
                  <p><strong>Owner:</strong> {businessInfo.ownerName}</p>
                  <p><strong>Phone:</strong> {businessInfo.phone}</p>
                  <p><strong>Email:</strong> {businessInfo.email}</p>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map(serviceId => {
                    const service = serviceCategories.find(s => s.id === serviceId);
                    return (
                      <span key={serviceId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {service?.icon} {service?.name}
                      </span>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Class Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Type:</strong> {classDetails.type}</p>
                  <p><strong>Duration:</strong> {classDetails.duration}</p>
                  <p><strong>Fee:</strong> ₹{classDetails.feeStructure.amount} {classDetails.feeStructure.type === 'per_session' ? 'per session' : 'monthly'}</p>
                </div>
              </Card>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-3">⏳</div>
                <div>
                  <h4 className="font-medium text-yellow-900 mb-1">What happens next?</h4>
                  <p className="text-sm text-yellow-800">
                    Our team will review your application within 24-48 hours. You'll receive an email notification once approved. After approval, your profile will be visible to parents in your area.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentStep(6)}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                {!isSubmitting && <CheckCircle className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-900">Provider Onboarding</h1>
            <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <Card className="p-6 max-w-2xl mx-auto">
          {renderStep()}
        </Card>
      </div>
    </div>
  );
}