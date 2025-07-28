import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { 
  ArrowLeft, MapPin, Phone, MessageCircle, Star, Clock, Users, 
  Heart, Share, CheckCircle, Camera, Calendar
} from 'lucide-react';
import { mockProviders, mockReviews } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import StarRating from '../components/UI/StarRating';

export default function ProviderDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState('');
  const [interestedClass, setInterestedClass] = useState('');
  const [message, setMessage] = useState('');

  const provider = mockProviders.find(p => p.id === id);
  const reviews = mockReviews.filter(r => r.provider === id);

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Provider not found</h2>
          <Button to="/home">Back to Home</Button>
        </div>
      </div>
    );
  }

  const handleEnquiry = () => {
    if (!selectedChild || !interestedClass || !message.trim()) {
      showError('Missing Information', 'Please fill all fields');
      return;
    }

    // Mock enquiry submission
    showSuccess('Enquiry Sent', 'Your enquiry has been sent successfully! The provider will contact you soon.');
    setShowEnquiryForm(false);
    navigate('/enquiries');
  };

  const handleWhatsApp = () => {
    if (provider.contact.whatsapp) {
      const message = `Hi! I'm interested in classes for my child at ${provider.name}. Can you please share more details?`;
      const url = `https://wa.me/${provider.contact.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  const getDistanceText = (distance: number) => {
    if (distance === 0) return 'Online Classes';
    return `${distance} km away`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex space-x-2">
            <button className="p-2">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2">
              <Share className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6">
        {/* Hero Image */}
        <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
          <img
            src={provider.images[0]}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h1 className="text-2xl font-bold mb-1">{provider.name}</h1>
                <div className="flex items-center space-x-2">
                  {provider.isVerified && (
                    <div className="flex items-center space-x-1 bg-green-500 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  )}
                  <span className="text-sm opacity-90">
                    {getDistanceText(provider.distance || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating and Quick Info */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <StarRating rating={provider.averageRating || 0} size="sm" />
                <span className="font-semibold text-gray-900">
                  {provider.averageRating}
                </span>
              </div>
              <span className="text-gray-600">
                {provider.totalReviews} reviews
              </span>
            </div>
            {provider.priceRange && (
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ₹{provider.priceRange.min}-{provider.priceRange.max}
                </p>
                <p className="text-sm text-gray-500">per session</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{provider.location.address}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {provider.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => setShowEnquiryForm(true)}
            className="flex items-center justify-center"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Enquire Now
          </Button>
          <Button
            onClick={handleWhatsApp}
            variant="outline"
            className="flex items-center justify-center"
          >
            <Phone className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>

        {/* About */}
        <Card className="p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">About</h3>
          <p className="text-gray-700 leading-relaxed">{provider.description}</p>
        </Card>

        {/* Classes Offered */}
        <Card className="p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Classes Offered</h3>
          <div className="space-y-3">
            {provider.classes.map(classItem => (
              <div key={classItem.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{classItem.name}</h4>
                  <span className="font-semibold text-purple-600">₹{classItem.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{classItem.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{classItem.ageGroup}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{classItem.duration}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    classItem.mode === 'online' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {classItem.mode}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    <strong>Schedule:</strong> {classItem.schedule.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Reviews */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Reviews</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.slice(0, 3).map(review => (
                <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{review.parentName}</span>
                        <span className="text-sm text-gray-500">for {review.childName}</span>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <span className="text-sm text-gray-500">
                      {review.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{review.comment}</p>
                  {review.helpful && (
                    <div className="mt-2 flex items-center space-x-2">
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        👍 Helpful ({review.helpful})
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No reviews yet</p>
            </div>
          )}
        </Card>

        {/* Contact Info */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700">{provider.contact.phone}</span>
            </div>
            {provider.contact.email && (
              <div className="flex items-center space-x-3">
                <span className="w-4 h-4 text-gray-600">✉️</span>
                <span className="text-gray-700">{provider.contact.email}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Enquiry Form Modal */}
      {showEnquiryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Send Enquiry</h3>
                <button
                  onClick={() => setShowEnquiryForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Child
                </label>
                <select
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a child</option>
                  {user?.children?.map(child => (
                    <option key={child.name} value={child.name}>
                      {child.name} (Age {child.age})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interested In
                </label>
                <select
                  value={interestedClass}
                  onChange={(e) => setInterestedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a class</option>
                  {provider.classes.map(classItem => (
                    <option key={classItem.id} value={classItem.name}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Tell us about your requirements, preferred timings, etc."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => setShowEnquiryForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEnquiry}
                  disabled={!selectedChild || !interestedClass || !message.trim()}
                  className="flex-1"
                >
                  Send Enquiry
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}