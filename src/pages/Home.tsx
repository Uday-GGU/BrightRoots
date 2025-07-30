import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Heart, Filter, ChevronRight, LogOut } from 'lucide-react';
import { categories, mockProviders } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StarRating from '../components/UI/StarRating';
import { ProviderService } from '../services/providerService';

// Service categories mapping for display
const categoryIcons = {
  tuition: '📚',
  music: '🎵',
  dance: '💃',
  sports: '⚽',
  coding: '💻',
  art: '🎨',
  daycare: '🏠',
  camps: '🏕️'
};

// 📏 Helper to calculate distance (Haversine formula)
function getDistance(loc1, loc2) {
  if (!loc1 || !loc2) return 0;
  
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(loc1.latitude)) *
      Math.cos(toRad(loc2.latitude)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Home() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showAllProviders, setShowAllProviders] = useState(false);

  // 🌍 Get Current Location or use user's saved location
  useEffect(() => {
    console.log('🌍 Setting up location detection...');
    
    if (user?.location?.coordinates) {
      console.log('📍 Using saved user location:', user.location.coordinates);
      setUserLocation({
        latitude: user.location.coordinates.lat,
        longitude: user.location.coordinates.lng
      });
    } else {
      console.log('🔍 Attempting to get current GPS location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('✅ GPS location captured:', pos.coords);
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (error) => {
          console.warn('❌ GPS location failed:', error);
          console.log('🔄 Using fallback location (Gurgaon)');
          setUserLocation({ latitude: 28.4595, longitude: 77.0266 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  }, [user]);

  useEffect(() => {
    if (userLocation) {
      loadProviders();
    }
  }, [userLocation, selectedCategory, user]);

  const loadProviders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is demo user
      const isDemoUser = localStorage.getItem('demoUser');
      
      if (isDemoUser) {
        console.log('👤 Demo user detected, using mock data');
        // Use mock data for demo users
        let sortedProviders = [...mockProviders];
        
        // Only sort by distance if user has location and not showing all providers
        if (userLocation && !showAllProviders) {
          sortedProviders = mockProviders
            .map(provider => ({
              ...provider,
              calculatedDistance: getDistance(userLocation, provider.location.coordinates)
            }))
            .sort((a, b) => a.calculatedDistance - b.calculatedDistance)
            .map(({ calculatedDistance, ...provider }) => ({
              ...provider,
              distance: Math.round(calculatedDistance * 10) / 10 // Round to 1 decimal
            }));
        } else {
          // Show all providers without distance sorting
          sortedProviders = mockProviders.map(provider => ({
            ...provider,
            distance: 0 // Set distance to 0 for "All locations"
          }));
        }
        
        setProviders(sortedProviders);
        setLoading(false);
        return;
      } else {
        console.log('🔗 Regular user, fetching from Supabase');
        // Fetch published providers from Supabase for real users
        let query = supabase
          .from('providers')
          .select(`
            *,
            provider_services(category),
            provider_classes(id, name, price, mode, age_group, duration),
            provider_media(file_path, media_type)
          `)
          .eq('is_published', true)
          .eq('status', 'approved');

        // Filter by category if selected
        if (selectedCategory) {
          query = query.eq('provider_services.category', selectedCategory);
        }

        // Filter by user's location if available and not showing all providers
        if (user?.location?.city && !showAllProviders) {
          query = query.eq('city', user.location.city);
        }

        const { data: publishedProviders, error: fetchError } = await query.order('created_at', { ascending: false });
        
        if (fetchError) {
          throw fetchError;
        }
        
        console.log('📊 Published providers from Supabase:', publishedProviders);
        
        // Convert to display format and sort by distance
        let convertedProviders = (publishedProviders || []).map((provider, index) => ({
          id: provider.id,
          name: provider.business_name,
          description: provider.description || `Professional services in ${provider.city}`,
          categories: provider.provider_services?.map(s => s.category) || [],
          location: {
            address: `${provider.area}, ${provider.city}`,
            city: provider.city,
            area: provider.area,
            coordinates: { 
              lat: provider.latitude || 28.4595, 
              lng: provider.longitude || 77.0266 
            }
          },
          contact: {
            phone: provider.phone,
            whatsapp: provider.whatsapp,
            email: provider.email
          },
          classes: provider.provider_classes?.map(cls => ({
            id: cls.id,
            name: cls.name,
            description: cls.description,
            ageGroup: cls.age_group,
            mode: cls.mode,
            price: cls.price,
            duration: cls.duration,
            schedule: cls.schedule || [],
            type: cls.mode,
            batchSize: cls.batch_size,
            feeType: cls.fee_type
          })) || [],
          images: provider.provider_media?.filter(m => m.media_type === 'profile_image').map(m => m.file_path) || 
                  [`https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=400`],
          isVerified: provider.is_verified,
          averageRating: 4.5 + Math.random() * 0.5,
          totalReviews: Math.floor(Math.random() * 50) + 10,
          distance: 0, // Will be calculated below
          tags: provider.is_verified ? ['verified', 'experienced'] : ['experienced'],
          priceRange: provider.provider_classes?.length > 0 ? {
            min: Math.min(...provider.provider_classes.map(c => c.price)),
            max: Math.max(...provider.provider_classes.map(c => c.price))
          } : { min: 1200, max: 2000 },
          createdAt: new Date(provider.created_at),
          updatedAt: new Date(provider.updated_at),
          status: provider.status
        }));

        // Sort by distance if user location is available
        if (userLocation && !showAllProviders) {
          convertedProviders = convertedProviders
            .map(provider => ({
              ...provider,
              distance: getDistance(userLocation, provider.location.coordinates)
            }))
            .sort((a, b) => a.distance - b.distance)
            .map(provider => ({
              ...provider,
              distance: Math.round(provider.distance * 10) / 10 // Round to 1 decimal
            }));
        } else if (showAllProviders) {
          // When showing all providers, set distance to 0
          convertedProviders = convertedProviders.map(provider => ({
            ...provider,
            distance: 0
          }));
        }
        
        console.log('✅ Converted and sorted providers for display:', convertedProviders);
        setProviders(convertedProviders);
      }
    } catch (err) {
      console.error('❌ Error loading providers:', err);
      setError(err.message || 'Failed to load providers');
      
      // Fallback to mock data on error
      console.log('🔄 Falling back to mock data due to error');
      let sortedMockProviders = [...mockProviders];
      
      if (userLocation) {
        sortedMockProviders = mockProviders
          .map(provider => ({
            ...provider,
            distance: getDistance(userLocation, provider.location.coordinates)
          }))
          .sort((a, b) => a.distance - b.distance)
          .map(provider => ({
            ...provider,
            distance: Math.round(provider.distance * 10) / 10
          }));
      }
      
      setProviders(sortedMockProviders);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || provider.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getDistanceText = (distance) => {
    if (distance === 0) return 'Online';
    if (showAllProviders) return 'All locations';
    return `${distance} km away`;
  };

  const handleViewAllProviders = () => {
    setShowAllProviders(!showAllProviders);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Location */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">You're browsing in</p>
                <p className="font-medium text-gray-900">
                  {showAllProviders ? 'All Locations' : 
                   user?.location ? `${user.location.area}, ${user.location.city}` : 'All Locations'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {user?.location && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleViewAllProviders}
                >
                  {showAllProviders ? 'Show Nearby' : 'View All'}
                </Button>
              )}
              <Button variant="outline" size="sm" to="/location">
                {user?.location ? 'Change' : 'Set Location'}
              </Button>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for classes, tutors, activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
            >
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse Categories</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedCategory 
              ? `${categories.find(c => c.id === selectedCategory)?.name} ${showAllProviders ? 'everywhere' : 'near you'}`
              : showAllProviders ? 'All providers' 
              : user?.location ? 'Top-rated providers near you'
              : 'All providers'
            }
          </h3>
          <span className="text-sm text-gray-500">
            {filteredProviders.length} found
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading providers...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <span className="text-4xl">⚠️</span>
              <h3 className="text-xl font-medium mt-2">Error Loading Providers</h3>
              <p className="text-red-400 mt-2">{error}</p>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Provider Cards */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredProviders.map(provider => (
              <Card key={provider.id} hover className="p-4">
                <div className="flex space-x-4">
                  {/* Provider Image */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={provider.images[0]}
                      alt={provider.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    {provider.isVerified && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Provider Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {provider.name}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {provider.description}
                        </p>
                      </div>
                      <button className="ml-2 p-1">
                        <Heart className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {provider.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Rating and Distance */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <StarRating rating={provider.averageRating || 0} size="sm" />
                          <span className="text-sm font-medium text-gray-900">
                            {provider.averageRating}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({provider.totalReviews})
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {showAllProviders ? 'All locations' : getDistanceText(provider.distance || 0)}
                        </span>
                      </div>
                      
                      {provider.priceRange && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₹{provider.priceRange.min}-{provider.priceRange.max}
                          </p>
                          <p className="text-xs text-gray-500">per session</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button
                    to={`/provider/${provider.id}`}
                    variant="outline"
                    className="w-full group"
                  >
                    <span>View Details & Enquire</span>
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredProviders.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium">No providers found</h3>
              <p className="text-gray-400 mt-2">
                {providers.length === 0 
                  ? showAllProviders 
                    ? "No providers available anywhere."
                    : "No providers have been added yet. Contact admin to add providers."
                  : "Try adjusting your search or browse different categories"
                }
              </p>
            </div>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
              variant="outline"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}