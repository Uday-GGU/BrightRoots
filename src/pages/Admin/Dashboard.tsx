import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  LogOut
} from 'lucide-react';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import { ProviderService } from '../../services/providerService';

interface Provider {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  area: string;
  categories: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  isPublished?: boolean;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);

  // Sample providers data
  const sampleProviders = [
    {
      user_id: null,
      business_name: 'Happy Minds Tuition Center',
      owner_name: 'Rajesh Kumar',
      email: 'happyminds@example.com',
      phone: '9876543210',
      whatsapp: '9876543210',
      description: 'Expert tutors for Math, Science, and English',
      address: 'MG Road, Bangalore',
      city: 'Bangalore',
      area: 'MG Road',
      pincode: '560001',
      latitude: 12.9716,
      longitude: 77.5946,
      status: 'approved' as const,
      is_published: true
    },
    {
      user_id: null,
      business_name: 'Tiny Talents Art School',
      owner_name: 'Priya Sharma',
      email: 'tinytalents@example.com',
      phone: '9999888877',
      whatsapp: '9999888877',
      description: 'Painting, Craft & Sketching for kids',
      address: 'Koramangala, Bangalore',
      city: 'Bangalore',
      area: 'Koramangala',
      pincode: '560034',
      latitude: 12.976,
      longitude: 77.58,
      status: 'approved' as const,
      is_published: true
    },
    {
      user_id: null,
      business_name: 'KickStart Football Club',
      owner_name: 'Amit Singh',
      email: 'kickstartfc@example.com',
      phone: '9900112233',
      whatsapp: '9900112233',
      description: 'Football coaching by certified trainers',
      address: 'Whitefield, Bangalore',
      city: 'Bangalore',
      area: 'Whitefield',
      pincode: '560066',
      latitude: 12.9702,
      longitude: 77.595,
      status: 'approved' as const,
      is_published: true
    }
  ];

  useEffect(() => {
    // Check admin authentication
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      navigate('/admin/login');
      return;
    }

    loadProviders();
    insertSampleProvidersIfNeeded();
  }, [navigate]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading providers from Supabase...');
      
      const { data, error } = await supabase
        .from('providers')
        .select(`
          *,
          provider_services(category)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading providers:', error);
        return;
      }

      const convertedProviders = data.map(provider => ({
        id: provider.id,
        businessName: provider.business_name,
        ownerName: provider.owner_name,
        email: provider.email,
        phone: provider.phone,
        city: provider.city,
        area: provider.area,
        categories: provider.provider_services?.map(s => s.category) || [],
        status: provider.status,
        createdAt: provider.created_at.split('T')[0],
        isPublished: provider.is_published
      }));

      console.log('✅ Loaded providers:', convertedProviders);
      setProviders(convertedProviders);
      
    } catch (error) {
      console.error('❌ Error in loadProviders:', error);
    } finally {
      setLoading(false);
    }
  };

  const insertSampleProvidersIfNeeded = async () => {
    try {
      // Check if sample data already exists
      const { data: existingProviders, error } = await supabase
        .from('providers')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Error checking existing providers:', error);
        return;
      }

      if (existingProviders && existingProviders.length > 0) {
        console.log('✅ Sample data already exists, skipping insertion');
        return;
      }

      console.log('🔄 Inserting sample providers data...');

      // Insert all sample providers
      for (const providerData of sampleProviders) {
        const newProvider = await ProviderService.createProvider(providerData);
        
        // Add services based on provider type
        let services: string[] = [];
        if (providerData.business_name.includes('Tuition')) {
          services = ['tuition'];
        } else if (providerData.business_name.includes('Art')) {
          services = ['art'];
        } else if (providerData.business_name.includes('Football')) {
          services = ['sports'];
        }
        
        if (services.length > 0) {
          await ProviderService.addProviderServices(newProvider.id, services);
          
          // Create sample classes
          if (services.includes('tuition')) {
            await ProviderService.createClass({
              provider_id: newProvider.id,
              name: 'Mathematics Classes',
              description: 'Expert tutoring for Math, Science, and English',
              category: 'tuition',
              age_group: '6-14 years',
              mode: 'offline',
              duration: '2 hours',
              price: 2000,
              fee_type: 'monthly',
              schedule: { timing: 'Mon-Fri 5PM-7PM' }
            });
          } else if (services.includes('art')) {
            await ProviderService.createClass({
              provider_id: newProvider.id,
              name: 'Art & Craft Classes',
              description: 'Painting, Craft & Sketching for kids',
              category: 'art',
              age_group: '4-10 years',
              mode: 'offline',
              duration: '2 hours',
              price: 1500,
              fee_type: 'monthly',
              schedule: { timing: 'Sat-Sun 10AM-12PM' }
            });
          } else if (services.includes('sports')) {
            await ProviderService.createClass({
              provider_id: newProvider.id,
              name: 'Football Training',
              description: 'Football coaching by certified trainers',
              category: 'sports',
              age_group: '8-16 years',
              mode: 'offline',
              duration: '2 hours',
              price: 2500,
              fee_type: 'monthly',
              schedule: { timing: 'Mon-Wed-Fri 6AM-8AM' }
            });
          }
        }
      }

      console.log('✅ Sample providers data inserted successfully');
      await loadProviders(); // Reload to show new data
      
    } catch (error) {
      console.error('❌ Error inserting sample providers:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  const handleStatusChange = async (providerId: string, newStatus: 'approved' | 'rejected') => {
    try {
      console.log('📢 Updating provider status:', providerId, 'to', newStatus);
      
      await ProviderService.updateProvider(providerId, { 
        status: newStatus,
        is_published: newStatus === 'approved'
      });
      
      await loadProviders();
      console.log('✅ Provider status updated successfully');
      
    } catch (error) {
      console.error('❌ Error updating provider status:', error);
      showError('Update Failed', 'Failed to update provider status. Please try again.');
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    try {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', providerId);
        
      if (error) throw error;
      
      showSuccess('Provider Deleted', 'Provider has been deleted successfully.');
      await loadProviders();
      
    } catch (error) {
      console.error('❌ Error deleting provider:', error);
      showError('Delete Failed', 'Failed to delete provider. Please try again.');
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string): string => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />
    };
    return icons[status as keyof typeof icons] || <Clock className="w-4 h-4" />;
  };

  const stats: Stats = {
    total: providers.length,
    approved: providers.filter(p => p.status === 'approved').length,
    pending: providers.filter(p => p.status === 'pending').length,
    rejected: providers.filter(p => p.status === 'rejected').length
  };

  const StatCard = ({ label, value, color, icon: Icon }: {
    label: string;
    value: number;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-opacity-20 ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage providers and platform settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/admin/add-provider')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Provider
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Providers" value={stats.total} color="text-blue-600" icon={Users} />
          <StatCard label="Approved" value={stats.approved} color="text-green-600" icon={CheckCircle} />
          <StatCard label="Pending" value={stats.pending} color="text-yellow-600" icon={Clock} />
          <StatCard label="Rejected" value={stats.rejected} color="text-red-600" icon={XCircle} />
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Providers Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first provider'
                }
              </p>
              <Button onClick={() => navigate('/admin/add-provider')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {provider.businessName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {provider.ownerName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{provider.email}</div>
                        <div className="text-sm text-gray-500">{provider.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{provider.city}</div>
                        <div className="text-sm text-gray-500">{provider.area}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {provider.categories.map(category => (
                            <span
                              key={category}
                              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
                          {getStatusIcon(provider.status)}
                          <span className="ml-1 capitalize">{provider.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {provider.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(provider.id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(provider.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => navigate(`/admin/provider/${provider.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/edit-provider/${provider.id}`)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProvider(provider.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}