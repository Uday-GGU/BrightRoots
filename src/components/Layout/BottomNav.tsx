import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, MessageCircle, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/enquiries', label: 'Enquiries', icon: MessageCircle },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
              location.pathname === to
                ? 'text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}