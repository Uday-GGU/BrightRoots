import { Provider, Enquiry, Review } from '../types';

export const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Harmony Music Academy',
    description: 'Professional music education with experienced instructors. We offer piano, guitar, violin, and vocal training for all age groups.',
    categories: ['music'],
    location: {
      address: 'Music Academy, Sector 15, Gurgaon',
      city: 'Gurgaon',
      area: 'Sector 15',
      coordinates: { lat: 28.4595, lng: 77.0266 }
    },
    contact: {
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      email: 'info@harmonymusic.com'
    },
    classes: [
      {
        id: 'c1',
        name: 'Piano for Beginners',
        description: 'Learn piano basics with fun exercises',
        ageGroup: '6-12 years',
        mode: 'offline',
        price: 1500,
        duration: '45 mins',
        schedule: ['Mon 4-5 PM', 'Wed 4-5 PM', 'Sat 10-11 AM']
      }
    ],
    images: ['https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=400'],
    isVerified: true,
    averageRating: 4.8,
    totalReviews: 24,
    distance: 2.3,
    tags: ['verified', 'experienced', 'group-classes'],
    priceRange: { min: 1200, max: 2000 }
  },
  {
    id: '2',
    name: 'Champions Sports Club',
    description: 'Complete sports training facility offering football, cricket, basketball, and swimming coaching for kids and teens.',
    categories: ['sports'],
    location: {
      address: 'Sports Complex, Phase 2, Gurgaon',
      city: 'Gurgaon',
      area: 'Phase 2',
      coordinates: { lat: 28.4421, lng: 77.0382 }
    },
    contact: {
      phone: '+91 98765 43211',
      whatsapp: '+91 98765 43211'
    },
    classes: [
      {
        id: 'c2',
        name: 'Youth Football Training',
        description: 'Professional football coaching for young athletes',
        ageGroup: '8-16 years',
        mode: 'offline',
        price: 2000,
        duration: '60 mins',
        schedule: ['Tue 5-6 PM', 'Thu 5-6 PM', 'Sun 9-10 AM']
      }
    ],
    images: ['https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=400'],
    isVerified: true,
    averageRating: 4.6,
    totalReviews: 18,
    distance: 3.1,
    tags: ['verified', 'outdoor', 'team-sports'],
    priceRange: { min: 1800, max: 2500 }
  },
  {
    id: '3',
    name: 'CodeCraft Academy',
    description: 'Making coding fun and accessible for kids. We teach Python, Scratch, web development, and robotics through interactive projects.',
    categories: ['coding'],
    location: {
      address: 'Online Classes',
      city: 'Gurgaon',
      area: 'Online',
      coordinates: { lat: 28.4595, lng: 77.0266 }
    },
    contact: {
      phone: '+91 98765 43212',
      email: 'hello@codecraft.in'
    },
    classes: [
      {
        id: 'c3',
        name: 'Python for Kids',
        description: 'Learn programming with fun Python projects',
        ageGroup: '10-16 years',
        mode: 'online',
        price: 1800,
        duration: '60 mins',
        schedule: ['Mon 6-7 PM', 'Wed 6-7 PM']
      }
    ],
    images: ['https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400'],
    isVerified: true,
    averageRating: 4.9,
    totalReviews: 31,
    distance: 0, // Online
    tags: ['verified', 'online', 'project-based'],
    priceRange: { min: 1500, max: 2200 }
  },
  {
    id: '4',
    name: 'Bright Minds Tuition Center',
    description: 'Expert academic coaching for all subjects. Specialized in CBSE, ICSE curriculum with proven track record of excellent results.',
    categories: ['tuition'],
    location: {
      address: 'Learning Center, Sector 22, Gurgaon',
      city: 'Gurgaon',
      area: 'Sector 22',
      coordinates: { lat: 28.4743, lng: 77.0465 }
    },
    contact: {
      phone: '+91 98765 43213',
      whatsapp: '+91 98765 43213'
    },
    classes: [
      {
        id: 'c4',
        name: 'Mathematics (Class 9-10)',
        description: 'Comprehensive math coaching with concept clarity',
        ageGroup: '14-16 years',
        mode: 'offline',
        price: 1200,
        duration: '90 mins',
        schedule: ['Mon 2-3:30 PM', 'Wed 2-3:30 PM', 'Fri 2-3:30 PM']
      }
    ],
    images: ['https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=400'],
    isVerified: true,
    averageRating: 4.7,
    totalReviews: 15,
    distance: 4.2,
    tags: ['verified', 'academic', 'small-batch'],
    priceRange: { min: 1000, max: 1500 }
  }
];

export const categories = [
  { id: 'tuition', name: 'Tuitions', icon: '📚', color: 'bg-blue-100 text-blue-800' },
  { id: 'music', name: 'Music', icon: '🎵', color: 'bg-purple-100 text-purple-800' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: 'bg-green-100 text-green-800' },
  { id: 'coding', name: 'Coding', icon: '💻', color: 'bg-orange-100 text-orange-800' },
  { id: 'dance', name: 'Dance', icon: '💃', color: 'bg-pink-100 text-pink-800' },
  { id: 'art', name: 'Art & Craft', icon: '🎨', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'daycare', name: 'Daycare', icon: '🏠', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'camps', name: 'Summer Camps', icon: '🏕️', color: 'bg-teal-100 text-teal-800' }
];

export const mockEnquiries: Enquiry[] = [
  {
    id: '1',
    provider: '1',
    providerName: 'Harmony Music Academy',
    parent: 'parent1',
    childName: 'Emma',
    childAge: 8,
    interestedIn: 'Piano for Beginners',
    message: 'Hi, I would like to know more about piano lessons for my 8-year-old daughter.',
    status: 'responded',
    createdAt: new Date(2025, 1, 10),
    response: 'Thank you for your interest! We have slots available on weekdays. Please call us to schedule a trial class.',
    responseAt: new Date(2025, 1, 10)
  },
  {
    id: '2',
    provider: '3',
    providerName: 'CodeCraft Academy',
    parent: 'parent1',
    childName: 'Liam',
    childAge: 10,
    interestedIn: 'Python for Kids',
    message: 'Is this suitable for a complete beginner? My son has no coding experience.',
    status: 'sent',
    createdAt: new Date(2025, 1, 12)
  }
];

export const mockReviews: Review[] = [
  {
    id: '1',
    provider: '1',
    parent: 'parent1',
    childName: 'Emma',
    rating: 5,
    comment: 'Excellent teacher! Emma loves her piano lessons and has improved so much.',
    createdAt: new Date(2025, 0, 28),
    parentName: 'Sarah Johnson',
    helpful: 12
  },
  {
    id: '2',
    provider: '1',
    parent: 'parent2',
    childName: 'Alex',
    rating: 5,
    comment: 'Very patient and skilled instructor. Great for beginners!',
    createdAt: new Date(2025, 0, 25),
    parentName: 'David Smith',
    helpful: 8
  },
  {
    id: '3',
    provider: '3',
    parent: 'parent3',
    childName: 'Maya',
    rating: 5,
    comment: 'Perfect introduction to coding. My daughter is now excited about programming!',
    createdAt: new Date(2025, 0, 22),
    parentName: 'Priya Sharma',
    helpful: 15
  }
];