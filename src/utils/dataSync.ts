// Cross-system data synchronization utility
// This simulates a shared backend by using a combination of localStorage and URL parameters

interface Provider {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  description?: string;
  city: string;
  area: string;
  pincode?: string;
  categories: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

class DataSyncManager {
  private static instance: DataSyncManager;
  private syncKey = 'brightroots_providers_sync';
  private lastSyncTime = 0;
  private syncInterval: number | null = null;

  static getInstance(): DataSyncManager {
    if (!DataSyncManager.instance) {
      DataSyncManager.instance = new DataSyncManager();
    }
    return DataSyncManager.instance;
  }

  // Initialize sync mechanism
  init() {
    console.log('🔄 Initializing cross-system data sync...');
    
    // Load initial data
    this.loadSharedData();
    
    // Start periodic sync
    this.startPeriodicSync();
    
    // Listen for URL hash changes (for cross-system communication)
    window.addEventListener('hashchange', this.handleHashChange.bind(this));
    
    // Listen for storage events (same browser, different tabs)
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  // Start periodic sync every 3 seconds
  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      console.log('⏰ Periodic sync check...');
      this.syncData();
    }, 3000);
  }

  // Stop periodic sync
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Load shared data from multiple sources
  loadSharedData(): Provider[] {
    try {
      // Try to load from localStorage first
      const localData = localStorage.getItem('adminProviders');
      let providers: Provider[] = [];
      
      if (localData) {
        providers = JSON.parse(localData);
        console.log('📊 Loaded providers from localStorage:', providers.length);
      }

      // Try to load from URL hash (for cross-system sharing)
      const hashData = this.getDataFromHash();
      if (hashData && hashData.length > 0) {
        console.log('🌐 Found providers in URL hash:', hashData.length);
        providers = this.mergeProviderData(providers, hashData);
      }

      // Try to load from sessionStorage (backup)
      const sessionData = sessionStorage.getItem('adminProviders');
      if (sessionData) {
        const sessionProviders = JSON.parse(sessionData);
        console.log('💾 Found providers in sessionStorage:', sessionProviders.length);
        providers = this.mergeProviderData(providers, sessionProviders);
      }

      // Save merged data back to localStorage
      if (providers.length > 0) {
        localStorage.setItem('adminProviders', JSON.stringify(providers));
        sessionStorage.setItem('adminProviders', JSON.stringify(providers));
      }

      return providers;
    } catch (error) {
      console.error('❌ Error loading shared data:', error);
      return [];
    }
  }

  // Merge provider data from different sources
  mergeProviderData(existing: Provider[], incoming: Provider[]): Provider[] {
    const merged = [...existing];
    
    incoming.forEach(incomingProvider => {
      const existingIndex = merged.findIndex(p => p.id === incomingProvider.id);
      
      if (existingIndex >= 0) {
        // Update existing provider if incoming data is newer
        const existingProvider = merged[existingIndex];
        const incomingTime = new Date(incomingProvider.createdAt).getTime();
        const existingTime = new Date(existingProvider.createdAt).getTime();
        
        if (incomingTime >= existingTime) {
          merged[existingIndex] = incomingProvider;
          console.log('🔄 Updated provider:', incomingProvider.businessName);
        }
      } else {
        // Add new provider
        merged.push(incomingProvider);
        console.log('➕ Added new provider:', incomingProvider.businessName);
      }
    });
    
    return merged;
  }

  // Save data to multiple storage locations
  saveProviders(providers: Provider[]) {
    try {
      const dataString = JSON.stringify(providers);
      
      // Save to localStorage
      localStorage.setItem('adminProviders', dataString);
      
      // Save to sessionStorage
      sessionStorage.setItem('adminProviders', dataString);
      
      // Save to URL hash for cross-system sharing
      this.saveDataToHash(providers);
      
      // Trigger events
      this.triggerSyncEvents(providers);
      
      console.log('💾 Saved providers to all storage locations:', providers.length);
    } catch (error) {
      console.error('❌ Error saving providers:', error);
    }
  }

  // Save data to URL hash (for cross-system sharing)
  saveDataToHash(providers: Provider[]) {
    try {
      // Only save essential data to avoid URL length limits
      const essentialData = providers.map(p => ({
        id: p.id,
        businessName: p.businessName,
        status: p.status,
        createdAt: p.createdAt
      }));
      
      const compressed = btoa(JSON.stringify(essentialData));
      const newHash = `#sync=${compressed}&t=${Date.now()}`;
      
      // Update hash without triggering hashchange event
      history.replaceState(null, '', newHash);
    } catch (error) {
      console.warn('⚠️ Could not save to URL hash:', error);
    }
  }

  // Get data from URL hash
  getDataFromHash(): Provider[] | null {
    try {
      const hash = window.location.hash;
      const syncMatch = hash.match(/sync=([^&]+)/);
      
      if (syncMatch) {
        const compressed = syncMatch[1];
        const decompressed = atob(compressed);
        const essentialData = JSON.parse(decompressed);
        
        // This is just essential data, we need to merge with full data
        return essentialData;
      }
    } catch (error) {
      console.warn('⚠️ Could not parse URL hash data:', error);
    }
    
    return null;
  }

  // Handle URL hash changes
  handleHashChange() {
    console.log('🔗 Hash changed, syncing data...');
    this.syncData();
  }

  // Handle storage changes
  handleStorageChange(event: StorageEvent) {
    if (event.key === 'adminProviders') {
      console.log('📦 Storage changed, syncing data...');
      this.syncData();
    }
  }

  // Sync data from all sources
  syncData() {
    const providers = this.loadSharedData();
    
    // Trigger custom events to notify components
    window.dispatchEvent(new CustomEvent('providerDataSynced', {
      detail: { providers, timestamp: Date.now() }
    }));
  }

  // Trigger sync events
  triggerSyncEvents(providers: Provider[]) {
    // Storage event
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'adminProviders',
      newValue: JSON.stringify(providers)
    }));
    
    // Custom event
    window.dispatchEvent(new CustomEvent('providerDataChanged', {
      detail: { action: 'dataSync', providers, timestamp: Date.now() }
    }));
  }

  // Get current providers
  getProviders(): Provider[] {
    return this.loadSharedData();
  }

  // Update provider status
  updateProviderStatus(providerId: string, status: 'approved' | 'rejected') {
    const providers = this.loadSharedData();
    const updatedProviders = providers.map(p => 
      p.id === providerId ? { ...p, status } : p
    );
    
    this.saveProviders(updatedProviders);
    console.log('📢 Provider status updated:', providerId, 'to', status);
  }

  // Add new provider
  addProvider(provider: Provider) {
    const providers = this.loadSharedData();
    const updatedProviders = [...providers, provider];
    
    this.saveProviders(updatedProviders);
    console.log('📢 New provider added:', provider.businessName);
  }
}

export const dataSyncManager = DataSyncManager.getInstance();