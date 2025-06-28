const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UserStatusData {
  userId: string;
  username: string;
  assignments: {
    [key: string]: {
      id: string;
      title: string;
      status: 'not_started' | 'in_progress' | 'submitted' | 'completed';
      startedAt?: string;
      submittedAt?: string;
      score?: number;
      feedback?: string;
    };
  };
  submissions: {
    [key: string]: {
      assignmentId: string;
      type: 'file' | 'url';
      content: string;
      submittedAt: string;
    };
  };
  stats: {
    totalAssignments: number;
    completedAssignments: number;
    pendingAssignments: number;
    averageScore: number;
  };
  lastActivity: string;
  updatedAt: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get user status
  async getUserStatus(userId: string): Promise<ApiResponse<UserStatusData>> {
    return this.makeRequest<UserStatusData>(`/user-status/${userId}`);
  }

  // Start assignment
  async startAssignment(userId: string, assignmentId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/user-status/${userId}/start-assignment`, {
      method: 'POST',
      body: JSON.stringify({ assignmentId }),
    });
  }

  // Submit assignment
  async submitAssignment(
    userId: string,
    assignmentId: string,
    submission: { type: 'file' | 'url'; content: string }
  ): Promise<ApiResponse<any>> {
    return this.makeRequest(`/user-status/${userId}/submit-assignment`, {
      method: 'POST',
      body: JSON.stringify({ assignmentId, submission }),
    });
  }

  // Update assignment status
  async updateAssignmentStatus(
    userId: string,
    assignmentId: string,
    updates: { status?: string; score?: number; feedback?: string }
  ): Promise<ApiResponse<any>> {
    return this.makeRequest(`/user-status/${userId}/assignment/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/user-status/${userId}/stats`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.makeRequest('/health');
  }
}

export const apiService = new ApiService();