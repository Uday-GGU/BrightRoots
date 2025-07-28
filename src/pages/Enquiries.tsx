import React, { useState } from 'react';
import { MessageCircle, Clock, CheckCircle, Phone, ArrowLeft } from 'lucide-react';
import { mockEnquiries } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

export default function Enquiries() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'sent' | 'responded' | 'closed'>('all');

  // For demo users, show all enquiries. For real users, filter by parent ID
  const isDemoUser = localStorage.getItem('demoUser');
  const userEnquiries = isDemoUser 
    ? mockEnquiries 
    : mockEnquiries.filter(enquiry => enquiry.parent === user?._id);
    
  const filteredEnquiries = userEnquiries.filter(enquiry => 
    filter === 'all' || enquiry.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'responded':
        return <CheckCircle className="w-4 h-4" />;
      case 'sent':
        return <Clock className="w-4 h-4" />;
      case 'closed':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 mr-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">My Enquiries</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {(['all', 'sent', 'responded', 'closed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Enquiries List */}
        <div className="space-y-4">
          {filteredEnquiries.length > 0 ? (
            filteredEnquiries.map(enquiry => (
              <Card key={enquiry.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {enquiry.providerName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      For {enquiry.childName} • {enquiry.interestedIn}
                    </p>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                    {getStatusIcon(enquiry.status)}
                    <span className="capitalize">{enquiry.status}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-700">{enquiry.message}</p>
                </div>

                {enquiry.response && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-purple-900 mb-1">Provider Response:</p>
                    <p className="text-sm text-purple-800">{enquiry.response}</p>
                    <p className="text-xs text-purple-600 mt-2">
                      {enquiry.responseAt?.toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Sent on {enquiry.createdAt.toLocaleDateString()}</span>
                  {enquiry.status === 'responded' && (
                    <Button size="sm" variant="outline">
                      <Phone className="w-3 h-3 mr-1" />
                      Call Now
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium">No enquiries found</h3>
                <p className="text-gray-400 mt-2">
                  {filter === 'all' 
                    ? "You haven't made any enquiries yet. Start exploring providers!" 
                    : `No ${filter} enquiries found.`
                  }
                </p>
              </div>
              {filter === 'all' && (
                <Button to="/home">
                  Explore Providers
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}