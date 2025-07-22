import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
  CheckCircle
} from 'lucide-react';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Listings', value: '12', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Active Students', value: '48', icon: Users, color: 'text-green-600' },
    { label: 'Average Rating', value: '4.8', icon: Star, color: 'text-yellow-600' },
    { label: 'Response Time', value: '< 2 hours', icon: Clock, color: 'text-purple-600' },
  ];

  const recentEnquiries = [
    { id: 1, parent: 'Priya Sharma', child: 'Aarav (8 years)', service: 'Piano Classes', time: '2 hours ago', status: 'pending' },
    { id: 2, parent: 'Rajesh Kumar', child: 'Ananya (12 years)', service: 'Math Tuition', time: '5 hours ago', status: 'responded' },
    { id: 3, parent: 'Meera Patel', child: 'Arjun (10 years)', service: 'Swimming', time: '1 day ago', status: 'confirmed' },
  ];

  const upcomingClasses = [
    { id: 1, title: 'Piano Basics', student: 'Aarav Sharma', time: '4:00 PM', date: 'Today' },
    { id: 2, title: 'Advanced Math', student: 'Ananya Kumar', time: '6:00 PM', date: 'Today' },
    { id: 3, title: 'Swimming Lessons', student: 'Arjun Patel', time: '10:00 AM', date: 'Tomorrow' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || 'Provider'}!</p>
            </div>
            <Button variant="primary" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Add New Listing
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Enquiries */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Enquiries</h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {recentEnquiries.map((enquiry) => (
                <div key={enquiry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{enquiry.parent}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        enquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        enquiry.status === 'responded' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {enquiry.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{enquiry.child} • {enquiry.service}</p>
                    <p className="text-xs text-gray-500 mt-1">{enquiry.time}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {enquiry.status === 'pending' ? 'Respond' : 'View'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Classes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Classes</h2>
              <Button variant="outline" size="sm">View Schedule</Button>
            </div>
            <div className="space-y-4">
              {upcomingClasses.map((class_) => (
                <div key={class_.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{class_.title}</h3>
                      <p className="text-sm text-gray-600">{class_.student}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{class_.time}</p>
                    <p className="text-xs text-gray-500">{class_.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Views</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Enquiries Received</span>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-medium">{'< 2 hours'}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-medium">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-medium">4.8/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-medium">156</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Listings</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month Earnings</span>
                  <span className="font-medium">₹45,600</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Growth</span>
                  <span className="font-medium text-green-600">+12%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard