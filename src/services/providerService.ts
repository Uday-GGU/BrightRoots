import { supabase, supabaseAdmin } from '../lib/supabase';
import { Database } from '../types/database';

type Provider = Database['public']['Tables']['providers']['Row'];
type ProviderInsert = Database['public']['Tables']['providers']['Insert'];
type ProviderUpdate = Database['public']['Tables']['providers']['Update'];
type ProviderClass = Database['public']['Tables']['provider_classes']['Row'];
type ProviderClassInsert = Database['public']['Tables']['provider_classes']['Insert'];
type ProviderService = Database['public']['Tables']['provider_services']['Row'];
type ProviderDocument = Database['public']['Tables']['provider_documents']['Row'];
type ProviderMedia = Database['public']['Tables']['provider_media']['Row'];
type Enquiry = Database['public']['Tables']['enquiries']['Row'];

export class ProviderService {
  // Provider CRUD operations
  static async createProvider(data: ProviderInsert): Promise<Provider> {
    console.log('🔧 ProviderService.createProvider called with:', data);
    
    const providerData = {
      ...data,
      is_published: data.status === 'approved' // Auto-publish if approved
    };
    
    console.log('🔧 Inserting provider data:', providerData);
    
    // Use regular supabase client instead of admin for now
    const { data: provider, error } = await supabase
      .from('providers')
      .insert(providerData)
      .select()
      .single();

    console.log('🔧 Insert result:', { provider, error });
    
    if (error) throw error;
    return provider;
  }

  static async getProvider(id: string): Promise<Provider | null> {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async getProviderByUserId(userId: string): Promise<Provider | null> {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  static async updateProvider(id: string, data: ProviderUpdate): Promise<Provider> {
    const updateData = {
      ...data,
      // Auto-publish when status changes to approved
      ...(data.status === 'approved' && { is_published: true }),
      // Unpublish when status changes to rejected or pending
      ...(data.status && data.status !== 'approved' && { is_published: false })
    };
    
    const { data: provider, error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return provider;
  }

  // Publish/Unpublish providers
  static async publishProvider(id: string): Promise<Provider> {
    const { data: provider, error } = await supabaseAdmin
      .from('providers')
      .update({ is_published: true, status: 'approved' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return provider;
  }

  static async unpublishProvider(id: string): Promise<Provider> {
    const { data: provider, error } = await supabaseAdmin
      .from('providers')
      .update({ is_published: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return provider;
  }

  // Fetch published providers for parents
  static async getPublishedProviders(filters?: {
    city?: string;
    area?: string;
    category?: string;
    search?: string;
  }): Promise<any[]> {
    let query = supabase
      .from('providers')
      .select(`
        *,
        provider_services(category),
        provider_classes(id, name, price, mode, age_group, duration),
        provider_media(file_path, media_type)
      `)
      .eq('is_published', true)
      .eq('status', 'approved');

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    if (filters?.area) {
      query = query.eq('area', filters.area);
    }

    if (filters?.search) {
      query = query.or(`business_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching published providers:', error);
      return [];
    }

    return data || [];
  }

  // Provider Services
  static async addProviderServices(providerId: string, categories: string[]): Promise<void> {
    const services = categories.map(category => ({
      provider_id: providerId,
      category: category as any
    }));

    const { error } = await supabaseAdmin
      .from('provider_services')
      .insert(services);

    if (error) throw error;
  }

  static async getProviderServices(providerId: string): Promise<ProviderService[]> {
    const { data, error } = await supabase
      .from('provider_services')
      .select('*')
      .eq('provider_id', providerId);

    if (error) throw error;
    return data || [];
  }

  // Provider Classes
  static async createClass(data: ProviderClassInsert): Promise<ProviderClass> {
    const { data: providerClass, error } = await supabaseAdmin
      .from('provider_classes')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return providerClass;
  }

  static async getProviderClasses(providerId: string): Promise<ProviderClass[]> {
    const { data, error } = await supabase
      .from('provider_classes')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateClass(id: string, data: Partial<ProviderClass>): Promise<ProviderClass> {
    const { data: providerClass, error } = await supabase
      .from('provider_classes')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return providerClass;
  }

  static async deleteClass(id: string): Promise<void> {
    const { error } = await supabase
      .from('provider_classes')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // Document Management
  static async uploadDocument(
    providerId: string,
    documentType: string,
    file: File
  ): Promise<ProviderDocument> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}_${Date.now()}.${fileExt}`;
    const filePath = `${providerId}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('provider-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Save document record
    const { data, error } = await supabase
      .from('provider_documents')
      .insert({
        provider_id: providerId,
        document_type: documentType as any,
        file_name: fileName,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getProviderDocuments(providerId: string): Promise<ProviderDocument[]> {
    const { data, error } = await supabase
      .from('provider_documents')
      .select('*')
      .eq('provider_id', providerId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Media Management
  static async uploadMedia(
    providerId: string,
    mediaType: string,
    file: File,
    caption?: string
  ): Promise<ProviderMedia> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${mediaType}_${Date.now()}.${fileExt}`;
    const filePath = `${providerId}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('provider-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Save media record
    const { data, error } = await supabase
      .from('provider_media')
      .insert({
        provider_id: providerId,
        media_type: mediaType as any,
        file_name: fileName,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        caption
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getProviderMedia(providerId: string): Promise<ProviderMedia[]> {
    const { data, error } = await supabase
      .from('provider_media')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Enquiry Management
  static async getProviderEnquiries(providerId: string): Promise<Enquiry[]> {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async respondToEnquiry(
    enquiryId: string,
    response: string
  ): Promise<Enquiry> {
    const { data, error } = await supabase
      .from('enquiries')
      .update({
        response,
        response_at: new Date().toISOString(),
        status: 'responded'
      })
      .eq('id', enquiryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Dashboard Stats
  static async getProviderStats(providerId: string) {
    const [enquiries, classes, bookings] = await Promise.all([
      supabase
        .from('enquiries')
        .select('id, status')
        .eq('provider_id', providerId),
      supabase
        .from('provider_classes')
        .select('id')
        .eq('provider_id', providerId)
        .eq('is_active', true),
      supabase
        .from('bookings')
        .select('id, status')
        .eq('provider_id', providerId)
    ]);

    const totalEnquiries = enquiries.data?.length || 0;
    const pendingEnquiries = enquiries.data?.filter(e => e.status === 'sent').length || 0;
    const totalClasses = classes.data?.length || 0;
    const activeBookings = bookings.data?.filter(b => b.status === 'confirmed').length || 0;

    return {
      totalEnquiries,
      pendingEnquiries,
      totalClasses,
      activeBookings
    };
  }

  // Search and Filter
  static async searchProviders(filters: {
    city?: string;
    area?: string;
    category?: string;
    search?: string;
  }) {
    let query = supabase
      .from('providers')
      .select(`
        *,
        provider_services(category),
        provider_classes(id, name, price, mode),
        provider_media(file_path, media_type)
      `)
      .eq('status', 'approved');

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.area) {
      query = query.eq('area', filters.area);
    }

    if (filters.search) {
      query = query.or(`business_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }
}