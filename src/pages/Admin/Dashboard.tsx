import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseAdmin } from '../../lib/supabase';
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
  LogOut,
  Database
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
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [isInsertingSampleData, setIsInsertingSampleData] = useState(false);

  useEffect(() => {
    // Check admin authentication
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      navigate('/admin/login');
      return;
    }

    // Load providers from Supabase
    loadProviders();
  }, [navigate]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading providers from Supabase...');
      
      // Get all providers (not just published ones) for admin view
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

      // Convert to admin dashboard format
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
        createdAt: provider.created_at.split('T')[0], // Format date
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

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  const handleStatusChange = (providerId: string, newStatus: 'approved' | 'rejected') => {
    const updateStatus = async () => {
      try {
        console.log('📢 Updating provider status:', providerId, 'to', newStatus);
        
        // Update in Supabase
        await ProviderService.updateProvider(providerId, { 
          status: newStatus,
          // Auto-publish when approved, unpublish when rejected
          is_published: newStatus === 'approved'
        });
        
        // Reload providers to get updated data
        await loadProviders();
        
        console.log('✅ Provider status updated successfully');
        
      } catch (error) {
        console.error('❌ Error updating provider status:', error);
        alert('Failed to update provider status. Please try again.');
      }
    };
    
    updateStatus();
  };

  const handleDeleteProvider = (providerId: string) => {
    if (confirm('Are you sure you want to delete this provider?')) {
      const deleteProvider = async () => {
        try {
          // In a real app, you'd have a delete method in ProviderService
          const { error } = await supabase
            .from('providers')
            .delete()
            .eq('id', providerId);
            
          if (error) throw error;
          
          // Reload providers
          await loadProviders();
          
        } catch (error) {
          console.error('❌ Error deleting provider:', error);
          alert('Failed to delete provider. Please try again.');
        }
      };
      
      deleteProvider();
  const insertSampleClassData = async () => {
    if (!confirm('This will add sample classes to all approved providers. Continue?')) {
      return;
    }

    setIsInsertingSampleData(true);
    
    try {
      console.log('📊 Inserting sample class data...');
      
      // Get all approved providers
      const approvedProviders = providers.filter(p => p.status === 'approved');
      
      if (approvedProviders.length === 0) {
        alert('No approved providers found. Please approve some providers first.');
        return;
      }

      let totalClassesAdded = 0;

      for (const provider of approvedProviders) {
        try {
          // Check if provider already has classes
          const existingClasses = await ProviderService.getProviderClasses(provider.id);
          
          if (existingClasses.length > 0) {
            console.log(`⏭️ Skipping ${provider.businessName} - already has ${existingClasses.length} classes`);
            continue;
          }

          // Create sample classes based on provider's categories
          for (const category of provider.categories) {
            const sampleClasses = getSampleClassesForCategory(category);
            
            for (const classData of sampleClasses) {
              await ProviderService.createClass({
                provider_id: provider.id,
                name: classData.name,
                description: classData.description,
                category: category,
                age_group: classData.ageGroup,
                mode: classData.mode,
                duration: classData.duration,
                price: classData.price,
                fee_type: classData.feeType,
                batch_size: classData.batchSize,
                schedule: classData.schedule
              });
              totalClassesAdded++;
            }
          }
          
          console.log(`✅ Added classes for ${provider.businessName}`);
        } catch (error) {
          console.error(`❌ Error adding classes for ${provider.businessName}:`, error);
        }
      }

      alert(`Successfully added ${totalClassesAdded} sample classes to ${approvedProviders.length} providers!`);
      
    } catch (error) {
      console.error('❌ Error inserting sample data:', error);
      alert('Failed to insert sample data. Please try again.');
    } finally {
      setIsInsertingSampleData(false);
    }
  };
    }
  const getSampleClassesForCategory = (category: string) => {
    const sampleClasses = {
      tuition: [
        {
          name: 'Mathematics (Class 9-10)',
          description: 'Comprehensive math coaching with concept clarity and problem-solving techniques',
          ageGroup: '14-16 years',
          mode: 'offline' as const,
          duration: '90 minutes',
          price: 1200,
          feeType: 'per_session' as const,
          batchSize: 8,
          schedule: { timings: ['Mon 4-5:30 PM', 'Wed 4-5:30 PM', 'Fri 4-5:30 PM'] }
        },
        {
          name: 'Science (Physics & Chemistry)',
          description: 'Interactive science classes with practical experiments and theory',
          ageGroup: '14-18 years',
          mode: 'offline' as const,
          duration: '2 hours',
          price: 1500,
          feeType: 'per_session' as const,
          batchSize: 6,
          schedule: { timings: ['Tue 5-7 PM', 'Thu 5-7 PM', 'Sat 10-12 PM'] }
        }
      ],
      music: [
        {
          name: 'Piano for Beginners',
          description: 'Learn piano basics with fun exercises and popular songs',
          ageGroup: '6-12 years',
          mode: 'offline' as const,
          duration: '45 minutes',
          price: 1500,
          feeType: 'per_session' as const,
          batchSize: 4,
          schedule: { timings: ['Mon 4-5 PM', 'Wed 4-5 PM', 'Sat 10-11 AM'] }
        },
        {
          name: 'Guitar Classes',
          description: 'Acoustic and electric guitar lessons for all skill levels',
          ageGroup: '10-18 years',
          mode: 'offline' as const,
          duration: '60 minutes',
          price: 1800,
          feeType: 'per_session' as const,
          batchSize: 3,
          schedule: { timings: ['Tue 5-6 PM', 'Thu 5-6 PM', 'Sun 11-12 PM'] }
        }
      ],
      dance: [
        {
          name: 'Classical Dance (Bharatanatyam)',
          description: 'Traditional Indian classical dance with proper technique and expressions',
          ageGroup: '8-16 years',
          mode: 'offline' as const,
          duration: '90 minutes',
          price: 2000,
          feeType: 'per_session' as const,
          batchSize: 10,
          schedule: { timings: ['Mon 6-7:30 PM', 'Wed 6-7:30 PM', 'Sat 4-5:30 PM'] }
        },
        {
          name: 'Hip Hop Dance',
          description: 'Modern hip hop dance moves and choreography for kids and teens',
          ageGroup: '10-18 years',
          mode: 'offline' as const,
          duration: '60 minutes',
          price: 1600,
          feeType: 'per_session' as const,
          batchSize: 12,
          schedule: { timings: ['Tue 6-7 PM', 'Thu 6-7 PM', 'Sun 5-6 PM'] }
        }
      ],
      sports: [
        {
          name: 'Football Training',
          description: 'Professional football coaching for young athletes with skill development',
          ageGroup: '8-16 years',
          mode: 'offline' as const,
          duration: '90 minutes',
          price: 2000,
          feeType: 'per_session' as const,
          batchSize: 15,
          schedule: { timings: ['Tue 5-6:30 PM', 'Thu 5-6:30 PM', 'Sun 9-10:30 AM'] }
        },
        {
          name: 'Swimming Classes',
          description: 'Learn swimming techniques from basic to advanced levels',
          ageGroup: '6-14 years',
          mode: 'offline' as const,
          duration: '60 minutes',
          price: 2500,
          feeType: 'per_session' as const,
          batchSize: 8,
          schedule: { timings: ['Mon 6-7 AM', 'Wed 6-7 AM', 'Fri 6-7 AM'] }
        }
      ],
      coding: [
        {
          name: 'Python for Kids',
          description: 'Learn programming with fun Python projects and games',
          ageGroup: '10-16 years',
          mode: 'online' as const,
          duration: '60 minutes',
          price: 1800,
          feeType: 'per_session' as const,
          batchSize: 6,
          schedule: { timings: ['Mon 6-7 PM', 'Wed 6-7 PM', 'Sat 11-12 PM'] }
        },
        {
          name: 'Web Development Basics',
          description: 'HTML, CSS, and JavaScript fundamentals for teenagers',
          ageGroup: '13-18 years',
          mode: 'online' as const,
          duration: '90 minutes',
          price: 2200,
          feeType: 'per_session' as const,
          batchSize: 5,
          schedule: { timings: ['Tue 7-8:30 PM', 'Thu 7-8:30 PM', 'Sun 2-3:30 PM'] }
        }
      ],
      art: [
        {
          name: 'Drawing & Sketching',
          description: 'Basic to advanced drawing techniques with pencil and charcoal',
          ageGroup: '8-16 years',
          mode: 'offline' as const,
          duration: '90 minutes',
          price: 1400,
          feeType: 'per_session' as const,
          batchSize: 8,
          schedule: { timings: ['Mon 4-5:30 PM', 'Wed 4-5:30 PM', 'Sat 2-3:30 PM'] }
        },
        {
          name: 'Painting Workshop',
          description: 'Watercolor and acrylic painting techniques for creative expression',
          ageGroup: '10-18 years',
          mode: 'offline' as const,
          duration: '2 hours',
          price: 1800,
          feeType: 'per_session' as const,
          batchSize: 6,
          schedule: { timings: ['Tue 4-6 PM', 'Thu 4-6 PM', 'Sun 10-12 PM'] }
        }
      ],
      daycare: [
        {
          name: 'After School Care',
          description: 'Safe and supervised after-school care with homework assistance',
          ageGroup: '6-12 years',
          mode: 'offline' as const,
          duration: '3 hours',
          price: 8000,
          feeType: 'monthly' as const,
          batchSize: 20,
          schedule: { timings: ['Mon-Fri 2-5 PM'] }
        },
        {
          name: 'Full Day Care',
          description: 'Complete daycare services with meals, activities, and learning',
          ageGroup: '3-6 years',
          mode: 'offline' as const,
          duration: '8 hours',
          price: 15000,
          feeType: 'monthly' as const,
          batchSize: 15,
          schedule: { timings: ['Mon-Fri 8 AM-4 PM'] }
        }
      ],
      camps: [
        {
          name: 'Summer Activity Camp',
          description: 'Fun-filled summer camp with sports, arts, and outdoor activities',
          ageGroup: '8-14 years',
          mode: 'offline' as const,
          duration: '6 hours',
          price: 12000,
          feeType: 'monthly' as const,
          batchSize: 25,
          schedule: { timings: ['Mon-Fri 9 AM-3 PM'] }
        },
        {
          name: 'STEM Camp',
          description: 'Science, technology, engineering, and math activities for curious minds',
          ageGroup: '10-16 years',
          mode: 'offline' as const,
          duration: '4 hours',
          price: 10000,
          feeType: 'monthly' as const,
          batchSize: 15,
          schedule: { timings: ['Mon-Fri 10 AM-2 PM'] }
        }
      ]
    };
  };
    return sampleClasses[category as keyof typeof sampleClasses] || [];
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const stats = {
    total: providers.length,
    approved: providers.filter(p => p.status === 'approved').length,
    pending: providers.filter(p => p.status === 'pending').length,
    rejected: providers.filter(p => p.status === 'rejected').length
  };

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
                onClick={insertSampleClassData}
                disabled={isInsertingSampleData}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                {isInsertingSampleData ? 'Adding Classes...' : 'Add Sample Classes'}
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
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Providers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </Card>
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

          {filteredProviders.length === 0 && (
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
          )}
        </Card>
      </div>
    </div>
  );
}