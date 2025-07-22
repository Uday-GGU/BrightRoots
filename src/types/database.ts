export interface Database {
  public: {
    Tables: {
      providers: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          owner_name: string;
          email: string;
          phone: string;
          whatsapp: string | null;
          website: string | null;
          description: string | null;
          address: string;
          city: string;
          area: string;
          pincode: string;
          latitude: number | null;
          longitude: number | null;
          status: 'pending' | 'approved' | 'rejected' | 'suspended';
          is_verified: boolean;
          verification_notes: string | null;
          created_at: string;
          updated_at: string;
          approved_at: string | null;
          approved_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          owner_name: string;
          email: string;
          phone: string;
          whatsapp?: string | null;
          website?: string | null;
          description?: string | null;
          address: string;
          city: string;
          area: string;
          pincode: string;
          latitude?: number | null;
          longitude?: number | null;
          status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          is_verified?: boolean;
          verification_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          owner_name?: string;
          email?: string;
          phone?: string;
          whatsapp?: string | null;
          website?: string | null;
          description?: string | null;
          address?: string;
          city?: string;
          area?: string;
          pincode?: string;
          latitude?: number | null;
          longitude?: number | null;
          status?: 'pending' | 'approved' | 'rejected' | 'suspended';
          is_verified?: boolean;
          verification_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
        };
      };
      provider_services: {
        Row: {
          id: string;
          provider_id: string;
          category: 'tuition' | 'music' | 'dance' | 'sports' | 'coding' | 'art' | 'daycare' | 'camps';
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          category: 'tuition' | 'music' | 'dance' | 'sports' | 'coding' | 'art' | 'daycare' | 'camps';
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          category?: 'tuition' | 'music' | 'dance' | 'sports' | 'coding' | 'art' | 'daycare' | 'camps';
          created_at?: string;
        };
      };
      provider_classes: {
        Row: {
          id: string;
          provider_id: string;
          name: string;
          description: string | null;
          category: string;
          age_group: string;
          mode: 'online' | 'offline' | 'hybrid';
          duration: string;
          price: number;
          fee_type: 'per_session' | 'monthly';
          batch_size: number | null;
          schedule: any; // JSON
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          name: string;
          description?: string | null;
          category: string;
          age_group: string;
          mode: 'online' | 'offline' | 'hybrid';
          duration: string;
          price: number;
          fee_type?: 'per_session' | 'monthly';
          batch_size?: number | null;
          schedule?: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          age_group?: string;
          mode?: 'online' | 'offline' | 'hybrid';
          duration?: string;
          price?: number;
          fee_type?: 'per_session' | 'monthly';
          batch_size?: number | null;
          schedule?: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      provider_documents: {
        Row: {
          id: string;
          provider_id: string;
          document_type: 'pan' | 'aadhaar' | 'business_registration' | 'certificate' | 'other';
          file_name: string;
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          is_verified: boolean;
          verification_notes: string | null;
          uploaded_at: string;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          id?: string;
          provider_id: string;
          document_type: 'pan' | 'aadhaar' | 'business_registration' | 'certificate' | 'other';
          file_name: string;
          file_path: string;
          file_size?: number | null;
          mime_type?: string | null;
          is_verified?: boolean;
          verification_notes?: string | null;
          uploaded_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          id?: string;
          provider_id?: string;
          document_type?: 'pan' | 'aadhaar' | 'business_registration' | 'certificate' | 'other';
          file_name?: string;
          file_path?: string;
          file_size?: number | null;
          mime_type?: string | null;
          is_verified?: boolean;
          verification_notes?: string | null;
          uploaded_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
      };
      provider_media: {
        Row: {
          id: string;
          provider_id: string;
          media_type: 'profile_image' | 'cover_image' | 'gallery' | 'video';
          file_name: string;
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          caption: string | null;
          display_order: number;
          is_active: boolean;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          media_type: 'profile_image' | 'cover_image' | 'gallery' | 'video';
          file_name: string;
          file_path: string;
          file_size?: number | null;
          mime_type?: string | null;
          caption?: string | null;
          display_order?: number;
          is_active?: boolean;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          media_type?: 'profile_image' | 'cover_image' | 'gallery' | 'video';
          file_name?: string;
          file_path?: string;
          file_size?: number | null;
          mime_type?: string | null;
          caption?: string | null;
          display_order?: number;
          is_active?: boolean;
          uploaded_at?: string;
        };
      };
      enquiries: {
        Row: {
          id: string;
          provider_id: string;
          parent_id: string;
          parent_name: string;
          parent_phone: string;
          parent_email: string | null;
          child_name: string;
          child_age: number;
          interested_class_id: string | null;
          message: string;
          status: 'sent' | 'responded' | 'closed';
          response: string | null;
          response_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          parent_id: string;
          parent_name: string;
          parent_phone: string;
          parent_email?: string | null;
          child_name: string;
          child_age: number;
          interested_class_id?: string | null;
          message: string;
          status?: 'sent' | 'responded' | 'closed';
          response?: string | null;
          response_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          parent_id?: string;
          parent_name?: string;
          parent_phone?: string;
          parent_email?: string | null;
          child_name?: string;
          child_age?: number;
          interested_class_id?: string | null;
          message?: string;
          status?: 'sent' | 'responded' | 'closed';
          response?: string | null;
          response_at?: string | null;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          provider_id: string;
          parent_id: string;
          class_id: string;
          enquiry_id: string | null;
          child_name: string;
          child_age: number;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          start_date: string | null;
          end_date: string | null;
          total_amount: number | null;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          parent_id: string;
          class_id: string;
          enquiry_id?: string | null;
          child_name: string;
          child_age: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          start_date?: string | null;
          end_date?: string | null;
          total_amount?: number | null;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          parent_id?: string;
          class_id?: string;
          enquiry_id?: string | null;
          child_name?: string;
          child_age?: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          start_date?: string | null;
          end_date?: string | null;
          total_amount?: number | null;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          provider_id: string;
          parent_id: string;
          booking_id: string | null;
          parent_name: string;
          child_name: string;
          rating: number;
          comment: string | null;
          is_verified: boolean;
          helpful_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          parent_id: string;
          booking_id?: string | null;
          parent_name: string;
          child_name: string;
          rating: number;
          comment?: string | null;
          is_verified?: boolean;
          helpful_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          parent_id?: string;
          booking_id?: string | null;
          parent_name?: string;
          child_name?: string;
          rating?: number;
          comment?: string | null;
          is_verified?: boolean;
          helpful_count?: number;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'enquiry' | 'booking' | 'review' | 'verification' | 'system';
          title: string;
          message: string;
          data: any; // JSON
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'enquiry' | 'booking' | 'review' | 'verification' | 'system';
          title: string;
          message: string;
          data?: any;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'enquiry' | 'booking' | 'review' | 'verification' | 'system';
          title?: string;
          message?: string;
          data?: any;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}