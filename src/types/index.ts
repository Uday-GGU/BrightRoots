export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'parent' | 'provider' | 'admin';
  location?: {
    city: string;
    area: string;
    pincode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  children?: Child[];
  wishlist?: string[];
  // Provider specific fields
  businessName?: string;
  whatsapp?: string;
  website?: string;
  isVerified?: boolean;
  isApproved?: boolean;
  documents?: {
    pan?: string;
    aadhaar?: string;
    businessRegistration?: string;
    certificates?: string[];
  };
}

export interface Child {
  name: string;
  age: number;
  interests: string[];
}

export interface Provider {
  id: string;
  name: string;
  description: string;
  categories: string[];
  location: {
    address: string;
    city: string;
    area: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    whatsapp?: string;
    email?: string;
  };
  classes: Class[];
  images: string[];
  isVerified: boolean;
  averageRating?: number;
  totalReviews?: number;
  distance?: number;
  tags: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Class {
  id: string;
  name: string;
  description: string;
  ageGroup: string;
  mode: 'online' | 'offline' | 'both';
  price: number;
  duration: string;
  schedule: string[];
  type: 'online' | 'offline' | 'hybrid';
  batchSize?: number;
  feeType: 'per_session' | 'monthly';
}

export interface Enquiry {
  id: string;
  provider: string;
  providerName: string;
  parent: string;
  childName: string;
  childAge: number;
  interestedIn: string;
  message: string;
  status: 'sent' | 'responded' | 'closed';
  createdAt: Date;
  response?: string;
  responseAt?: Date;
}

export interface Review {
  id: string;
  provider: string;
  parent: string;
  childName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  parentName: string;
  helpful?: number;
}

export interface OnboardingData {
  step: number;
  location?: {
    city: string;
    area: string;
    pincode: string;
    coordinates: { lat: number; lng: number };
  };
  businessInfo?: {
    businessName: string;
    ownerName: string;
    phone: string;
    whatsapp?: string;
    email: string;
    website?: string;
  };
  services?: string[];
  classDetails?: {
    type: 'online' | 'offline' | 'hybrid';
    ageGroups: string[];
    timings: string[];
    duration: string;
    feeStructure: {
      type: 'per_session' | 'monthly';
      amount: number;
    };
  };
  media?: {
    profileImage?: string;
    coverImage?: string;
    gallery?: string[];
    videoUrl?: string;
  };
  documents?: {
    pan?: string;
    aadhaar?: string;
    businessRegistration?: string;
    certificates?: string[];
  };
}