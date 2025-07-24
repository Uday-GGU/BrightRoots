import React, { useState } from 'react';
import { Search, MapPin, Star, Heart, Filter, ChevronRight, LogOut } from 'lucide-react';
import { categories } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
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

export default function Home() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load published providers from Supabase
  React.useEffect(() => {
    const loadPublishedProviders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Loading published providers from Supabase...');
        
        // Get user location for filtering
        const filters = {
          city: user?.location?.city,
          area: user?.location?.area,
          search: searchTerm,
          category: selectedCategory
        };
        
        const publishedProviders = await ProviderService.getPublishedProviders(filters);
        console.log('📊 Published providers from Supabase:', publishedProviders);
        
        // Convert Supabase provider format to display format
        const convertedProviders = publishedProviders.map(provider => {
          const services = provider.provider_services || [];
          const classes = provider.provider_classes || [];
          const media = provider.provider_media || [];
          
          // Get profile image or use default
          const profileImage = media.find(m => m.media_type === 'profile_image')?.file_path ||
                              'https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg';
          
          return {
            id: provider.id,
            name: provider.business_name,
            description: provider.description || `Professional ${services.map(s => s.category).join(', ')} services`,
            categories: services.map(s => s.category),
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
            classes: classes.map(cls => ({
              id: cls.id,
              name: cls.name,
              description: `Professional ${cls.name} training`,
              ageGroup: cls.age_group,
              mode: cls.mode,
              price: cls.price,
              duration: cls.duration,
              schedule: ['Mon 4-5 PM', 'Wed 4-5 PM', 'Sat 10-11 AM'], // Mock schedule
              type: cls.mode,
              batchSize: 8,
              feeType: 'per_session'
            })),
            images: [profileImage],
            isVerified: provider.is_verified,
            averageRating: 4.5 + Math.random() * 0.5, // Mock rating
            totalReviews: Math.floor(Math.random() * 50) + 10, // Mock reviews
            distance: Math.floor(Math.random() * 10) + 1, // Mock distance
            tags: ['verified', 'experienced'],
            priceRange: classes.length > 0 ? {
              min: Math.min(...classes.map(c => c.price)),
              max: Math.max(...classes.map(c => c.price))
            } : { min: 1200, max: 2000 },
            createdAt: new Date(provider.created_at),
            updatedAt: new Date(provider.updated_at),
            status: provider.status
          };
        });
        
        console.log('✅ Converted providers:', convertedProviders);
        setProviders(convertedProviders);
        
      } catch (error) {
        console.error('❌ Error loading published providers:', error);
        setError('Failed to load providers. Please try again.');
        
        // Fallback to empty array
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    loadPublishedProviders();
  }, [user?.location, searchTerm, selectedCategory]);

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || provider.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory && provider.isVerified;
  });

  const getDistanceText = (distance: number) => {
    if (distance === 0) return 'Online';
    return `${distance} km away`;
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
                  {user?.location ? `${user.location.area}, ${user.location.city}` : 'Select Location'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" to="/location">
                Change
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
              ? `${categories.find(c => c.id === selectedCategory)?.name} near you`
              : 'Top-rated providers'
            }
          </h3>
          <span className="text-sm text-gray-500">
            {filteredProviders.length} found
          </span>
        </div>

        {/* Provider Cards */}
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
                        {getDistanceText(provider.distance || 0)}
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

        {!loading && !error && filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium">No providers found</h3>
              <p className="text-gray-400 mt-2">
                {providers.length === 0 
                  ? "No published providers available in your area yet."
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