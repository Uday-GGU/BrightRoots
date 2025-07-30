import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProviderService } from '../services/providerService';
import { Database } from '../types/database';

type Provider = Database['public']['Tables']['providers']['Row'];
type ProviderClass = Database['public']['Tables']['provider_classes']['Row'];
type Enquiry = Database['public']['Tables']['enquiries']['Row'];
import { User } from 'lucide-react';

export function useProvider() {
  const { user } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'provider') {
      loadProvider();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProvider = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) return;
      
      const providerData = await ProviderService.getProviderByUserId(user.id);
      setProvider(providerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provider');
    } finally {
      setLoading(false);
    }
  };

  const createProvider = async (data: any) => {
    try {
      setError(null);
      
      if (!user?.id) throw new Error('User not authenticated');
      
      const newProvider = await ProviderService.createProvider({
        ...data,
        user_id: user.id
      });
      
      setProvider(newProvider);
      return newProvider;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create provider');
      throw err;
    }
  };

  const updateProvider = async (data: any) => {
    try {
      setError(null);
      
      if (!provider?.id) throw new Error('Provider not found');
      
      const updatedProvider = await ProviderService.updateProvider(provider.id, data);
      setProvider(updatedProvider);
      return updatedProvider;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update provider');
      throw err;
    }
  };

  return {
    provider,
    loading,
    error,
    createProvider,
    updateProvider,
    refetch: loadProvider
  };
}

export function useProviderClasses(providerId?: string) {
  const [classes, setClasses] = useState<ProviderClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providerId) {
      loadClasses();
    }
  }, [providerId]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!providerId) return;
      
      const classesData = await ProviderService.getProviderClasses(providerId);
      setClasses(classesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (data: any) => {
    try {
      setError(null);
      
      if (!providerId) throw new Error('Provider ID required');
      
      const newClass = await ProviderService.createClass({
        ...data,
        provider_id: providerId
      });
      
      setClasses(prev => [newClass, ...prev]);
      return newClass;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class');
      throw err;
    }
  };

  const updateClass = async (classId: string, data: any) => {
    try {
      setError(null);
      
      const updatedClass = await ProviderService.updateClass(classId, data);
      setClasses(prev => prev.map(c => c.id === classId ? updatedClass : c));
      return updatedClass;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update class');
      throw err;
    }
  };

  const deleteClass = async (classId: string) => {
    try {
      setError(null);
      
      await ProviderService.deleteClass(classId);
      setClasses(prev => prev.filter(c => c.id !== classId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class');
      throw err;
    }
  };

  return {
    classes,
    loading,
    error,
    createClass,
    updateClass,
    deleteClass,
    refetch: loadClasses
  };
}

export function useProviderEnquiries(providerId?: string) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providerId) {
      loadEnquiries();
    }
  }, [providerId]);

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!providerId) return;
      
      const enquiriesData = await ProviderService.getProviderEnquiries(providerId);
      setEnquiries(enquiriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const respondToEnquiry = async (enquiryId: string, response: string) => {
    try {
      setError(null);
      
      const updatedEnquiry = await ProviderService.respondToEnquiry(enquiryId, response);
      setEnquiries(prev => prev.map(e => e.id === enquiryId ? updatedEnquiry : e));
      return updatedEnquiry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to respond to enquiry');
      throw err;
    }
  };

  return {
    enquiries,
    loading,
    error,
    respondToEnquiry,
    refetch: loadEnquiries
  };
}

export function useProviderStats(providerId?: string) {
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    pendingEnquiries: 0,
    totalClasses: 0,
    activeBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providerId) {
      loadStats();
    }
  }, [providerId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!providerId) return;
      
      const statsData = await ProviderService.getProviderStats(providerId);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refetch: loadStats
  };
}