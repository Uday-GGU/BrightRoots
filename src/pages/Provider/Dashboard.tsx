import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProvider, useProviderClasses } from '../../hooks/useProvider';
import { ProviderService } from '../../services/providerService';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { 
  BookOpen, 
  Users, 
  Star, 
  Clock, 
  TrendingUp, 
  MessageSquare,
  Calendar,
  DollarSign,
  Eye,
  CheckCircle,
  LogOut,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Save,
  X,
  User
} from 'lucide-react';

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

export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const { provider, loading: providerLoading, updateProvider } = useProvider();
  const { classes, loading: classesLoading, createClass, updateClass, deleteClass } = useProviderClasses(provider?.id);
  const { showSuccess, showError } = useToast();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'courses'>('dashboard');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    business_name: '',
    owner_name: '',
    phone: '',
    email: '',
    whatsapp: '',
    website: '',
    description: '',
    address: '',
    city: '',
    area: '',
    pincode: ''
  });

  // Course form state
  const [courseForm, setCourseForm] = useState({
    name: '',
    category: '',
    description: '',
    age_group: '',
    mode: 'offline' as 'online' | 'offline' | 'hybrid',
    duration: '',
    price: 0,
    fee_type: 'per_session' as 'per_session' | 'monthly',
    schedule: '',
    is_active: true
  });

  // Load provider data into form
  useEffect(() => {
    if (provider) {
      setProfileForm({
        business_name: provider.business_name || '',
        owner_name: provider.owner_name || '',
        phone: provider.phone || '',
        email: provider.email || '',
        whatsapp: provider.whatsapp || '',
        website: provider.website || '',
        description: provider.description || '',
        address: provider.address || '',
        city: provider.city || '',
        area: provider.area || '',
        pincode: provider.pincode || ''
      });
    }
  }, [provider]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;

    setIsSubmitting(true);
    try {
      await updateProvider(profileForm);
      setShowProfileEdit(false);
      showSuccess('Profile Updated', 'Your profile has been updated successfully');
    } catch (error) {
      showError('Update Failed', 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;

    setIsSubmitting(true);
    try {
      const courseData = {
        ...courseForm,
        provider_id: provider.id,
        schedule: courseForm.schedule ? { timing: courseForm.schedule } : null
      };

      if (editingCourse) {
        await updateClass(editingCourse.id, courseData);
        showSuccess('Course Updated', 'Course has been updated successfully');
      } else {
        await createClass(courseData);
        showSuccess('Course Added', 'New course has been added successfully');
      }

      setShowCourseForm(false);
      setEditingCourse(null);
      resetCourseForm();
    } catch (error) {
      showError('Operation Failed', 'Failed to save course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCourse = (course: any) => {
    setCourseForm({
      name: course.name || '',
      category: course.category || '',
      description: course.description || '',
      age_group: course.age_group || '',
      mode: course.mode || 'offline',
      duration: course.duration || '',
      price: course.price || 0,
      fee_type: course.fee_type || 'per_session',
      schedule: course.schedule?.timing || '',
      is_active: course.is_active !== false
    });
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await deleteClass(courseId);
      showSuccess('Course Deleted', 'Course has been deleted successfully');
    } catch (error) {
      showError('Delete Failed', 'Failed to delete course. Please try again.');
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      name: '',
      category: '',
      description: '',
      age_group: '',
      mode: 'offline',
      duration: '',
      price: 0,
      fee_type: 'per_session',
      schedule: '',
      is_active: true
    });
  };

  const stats = [
    { label: 'Total Courses', value: classes?.length || 0, icon: BookOpen, color: 'text-blue-600' },
    { label: 'Active Courses', value: classes?.filter(c => c.is_active).length || 0, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Profile Status', value: provider?.status || 'Pending', icon: Star, color: 'text-yellow-600' },
    { label: 'Published', value: provider?.is_published ? 'Yes' : 'No', icon: Eye, color: 'text-purple-600' },
  ];

  if (providerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Provider Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Please complete your onboarding process.</p>
          <Button to="/provider/setup">Complete Profile Setup</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
              <p className="text-gray-600">Welcome back, {provider.owner_name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={logout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8 border-b">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'courses', label: 'Courses', icon: BookOpen }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setActiveTab('courses')}
                    className="w-full justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Course
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('profile')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>• Profile created</p>
                  <p>• {classes?.length || 0} courses added</p>
                  <p>• Status: {provider.status}</p>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Profile Information</h2>
              <Button 
                onClick={() => setShowProfileEdit(!showProfileEdit)}
                variant={showProfileEdit ? "outline" : "primary"}
              >
                {showProfileEdit ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>

            {showProfileEdit ? (
              <Card className="p-6">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.business_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, business_name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Owner Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.owner_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, owner_name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={profileForm.whatsapp}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profileForm.website}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area
                      </label>
                      <input
                        type="text"
                        value={profileForm.area}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, area: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={profileForm.pincode}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, pincode: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={profileForm.description}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowProfileEdit(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Business Name</h3>
                      <p className="mt-1 text-sm text-gray-900">{provider.business_name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Owner Name</h3>
                      <p className="mt-1 text-sm text-gray-900">{provider.owner_name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p className="mt-1 text-sm text-gray-900">{provider.phone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-sm text-gray-900">{provider.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Location</h3>
                      <p className="mt-1 text-sm text-gray-900">{provider.area}, {provider.city}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{provider.status}</p>
                    </div>
                  </div>
                  {provider.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-sm text-gray-900">{provider.description}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Manage Courses</h2>
              <Button 
                onClick={() => {
                  resetCourseForm();
                  setEditingCourse(null);
                  setShowCourseForm(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Course
              </Button>
            </div>

            {/* Course Form Modal */}
            {showCourseForm && (
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCourseForm(false);
                      setEditingCourse(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleCourseSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Name *
                      </label>
                      <input
                        type="text"
                        value={courseForm.name}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={courseForm.category}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        {serviceCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age Group *
                      </label>
                      <select
                        value={courseForm.age_group}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, age_group: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Age Group</option>
                        {ageGroups.map(age => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mode *
                      </label>
                      <select
                        value={courseForm.mode}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, mode: e.target.value as any }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="offline">Offline</option>
                        <option value="online">Online</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration *
                      </label>
                      <input
                        type="text"
                        value={courseForm.duration}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 1 hour, 45 minutes"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fee *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={courseForm.price}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <select
                          value={courseForm.fee_type}
                          onChange={(e) => setCourseForm(prev => ({ ...prev, fee_type: e.target.value as any }))}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="per_session">Per Session</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Schedule
                      </label>
                      <input
                        type="text"
                        value={courseForm.schedule}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, schedule: e.target.value }))}
                        placeholder="e.g., Mon-Wed-Fri 4-5 PM"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={courseForm.is_active}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                        Active (visible to parents)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={courseForm.description}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCourseForm(false);
                        setEditingCourse(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Add Course'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Courses List */}
            {classesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading courses...</p>
              </div>
            ) : classes && classes.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {classes.map((course) => (
                  <Card key={course.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {course.name}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {course.category}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            {course.age_group}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            course.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {course.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {course.description}
                        </p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p><strong>Mode:</strong> {course.mode}</p>
                          <p><strong>Duration:</strong> {course.duration}</p>
                          <p><strong>Fee:</strong> ₹{course.price} {course.fee_type === 'per_session' ? 'per session' : 'monthly'}</p>
                          {course.schedule?.timing && (
                            <p><strong>Schedule:</strong> {course.schedule.timing}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEditCourse(course)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteCourse(course.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-6">
                  Start by adding your first course to attract students
                </p>
                <Button 
                  onClick={() => {
                    resetCourseForm();
                    setEditingCourse(null);
                    setShowCourseForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Course
                </Button>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}