import { UserProgress, UserDataManager } from './userData';
import { BackendUserDataManager } from './userDataManager';

export class HybridUserDataManager {
  private static instance: HybridUserDataManager;
  private localManager: UserDataManager;
  private backendManager: BackendUserDataManager;
  private useBackend: boolean = false;

  constructor() {
    this.localManager = UserDataManager.getInstance();
    this.backendManager = BackendUserDataManager.getInstance();
    this.checkBackendAvailability();
  }

  static getInstance(): HybridUserDataManager {
    if (!HybridUserDataManager.instance) {
      HybridUserDataManager.instance = new HybridUserDataManager();
    }
    return HybridUserDataManager.instance;
  }

  private async checkBackendAvailability(): Promise<void> {
    try {
      this.useBackend = await this.backendManager.isBackendAvailable();
      console.log(`Using ${this.useBackend ? 'backend' : 'local'} data manager`);
    } catch (error) {
      console.warn('Backend not available, falling back to local storage');
      this.useBackend = false;
    }
  }

  // Authentication (always local for security)
  authenticateUser(username: string, password: string): UserProgress | null {
    return this.localManager.authenticateUser(username, password);
  }

  // Get user data
  async getUserData(userId: string): Promise<UserProgress | null> {
    if (this.useBackend) {
      try {
        const backendData = await this.backendManager.getUserData(userId);
        if (backendData) {
          // Sync with local storage for offline capability
          this.localManager.updateUserData(userId, backendData);
          return backendData;
        }
      } catch (error) {
        console.warn('Backend failed, falling back to local data:', error);
      }
    }
    
    return this.localManager.getUserData(userId);
  }

  // Start assignment
  async startAssignment(userId: string, assignmentId: string): Promise<void> {
    // Always update local first for immediate UI response
    this.localManager.startAssignment(userId, assignmentId);
    
    if (this.useBackend) {
      try {
        await this.backendManager.startAssignment(userId, assignmentId);
      } catch (error) {
        console.warn('Failed to sync assignment start with backend:', error);
      }
    }
  }

  // Submit assignment
  async submitAssignment(
    userId: string,
    assignmentId: string,
    submission: { type: 'file' | 'url'; content: string }
  ): Promise<void> {
    // Always update local first for immediate UI response
    this.localManager.submitAssignment(userId, assignmentId, submission);
    
    if (this.useBackend) {
      try {
        await this.backendManager.submitAssignment(userId, assignmentId, submission);
      } catch (error) {
        console.warn('Failed to sync assignment submission with backend:', error);
      }
    }
  }

  // Notification methods (local only)
  addNotification(userId: string, notification: UserProgress['notifications'][0]): void {
    this.localManager.addNotification(userId, notification);
  }

  markNotificationAsRead(userId: string, notificationId: string): void {
    this.localManager.markNotificationAsRead(userId, notificationId);
  }

  // Live updates (local only)
  getLiveUpdates() {
    return this.localManager.getLiveUpdates();
  }

  refreshLiveUpdates(): void {
    this.localManager.refreshLiveUpdates();
  }

  // Force backend sync
  async syncWithBackend(userId: string): Promise<boolean> {
    if (!this.useBackend) return false;
    
    try {
      const localData = this.localManager.getUserData(userId);
      const backendData = await this.backendManager.getUserData(userId);
      
      if (localData && backendData) {
        // Merge data (backend takes precedence for status)
        const mergedData = {
          ...localData,
          assignments: backendData.assignments,
          submissions: backendData.submissions,
          stats: backendData.stats
        };
        
        this.localManager.updateUserData(userId, mergedData);
        return true;
      }
    } catch (error) {
      console.error('Failed to sync with backend:', error);
    }
    
    return false;
  }

  // Get current mode
  isUsingBackend(): boolean {
    return this.useBackend;
  }

  // Force backend check
  async recheckBackend(): Promise<void> {
    await this.checkBackendAvailability();
  }
}