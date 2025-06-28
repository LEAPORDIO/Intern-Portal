import { apiService, UserStatusData } from '../services/apiService';
import { UserProgress } from './userData';

export class BackendUserDataManager {
  private static instance: BackendUserDataManager;
  private cache: Map<string, UserStatusData> = new Map();

  static getInstance(): BackendUserDataManager {
    if (!BackendUserDataManager.instance) {
      BackendUserDataManager.instance = new BackendUserDataManager();
    }
    return BackendUserDataManager.instance;
  }

  // Convert backend data to frontend format
  private convertToUserProgress(backendData: UserStatusData): UserProgress {
    return {
      userId: backendData.userId,
      username: backendData.username,
      password: '', // Not stored in backend
      assignments: backendData.assignments,
      submissions: backendData.submissions,
      notifications: [], // Handle separately if needed
      stats: backendData.stats
    };
  }

  // Get user data from backend
  async getUserData(userId: string): Promise<UserProgress | null> {
    try {
      const response = await apiService.getUserStatus(userId);
      
      if (response.success && response.data) {
        this.cache.set(userId, response.data);
        return this.convertToUserProgress(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return null;
    }
  }

  // Start assignment
  async startAssignment(userId: string, assignmentId: string): Promise<boolean> {
    try {
      const response = await apiService.startAssignment(userId, assignmentId);
      
      if (response.success) {
        // Invalidate cache to force refresh
        this.cache.delete(userId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to start assignment:', error);
      return false;
    }
  }

  // Submit assignment
  async submitAssignment(
    userId: string,
    assignmentId: string,
    submission: { type: 'file' | 'url'; content: string }
  ): Promise<boolean> {
    try {
      const response = await apiService.submitAssignment(userId, assignmentId, submission);
      
      if (response.success) {
        // Invalidate cache to force refresh
        this.cache.delete(userId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      return false;
    }
  }

  // Check if backend is available
  async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await apiService.healthCheck();
      return response.success;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}