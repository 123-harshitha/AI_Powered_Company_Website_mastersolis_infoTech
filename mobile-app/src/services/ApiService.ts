import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private static instance: ApiService;
  private baseURL = 'http://localhost:3001/api';
  private authToken: string | null = null;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    if (!this.authToken) {
      this.authToken = await AsyncStorage.getItem('authToken');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
  console.log("🔗", { url, method: options.method || "GET" });

    try {
      const response = await fetch(url, {
        ...options,
        headers: await this.getAuthHeaders(),
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        try {
          const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
            method: 'POST',
            headers: await this.getAuthHeaders(),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            this.authToken = refreshData.token;
            await AsyncStorage.setItem('authToken', refreshData.token);

            // Retry original request
            const retryResponse = await fetch(url, {
              ...options,
              headers: await this.getAuthHeaders(),
            });
            return retryResponse.json();
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
        
        // If refresh fails, redirect to login
        throw new Error('Authentication required');
      }

      return response.json();
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      throw error;
    }
  }

  // Employee endpoints
  async getEmployeeProfile(): Promise<any> {
    return this.makeRequest('/employees/profile');
  }

  async updateEmployeeProfile(data: any): Promise<any> {
    return this.makeRequest('/employees/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAttendanceHistory(params?: any): Promise<any> {
    const queryParams = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/attendance/employee${queryParams}`);
  }

  async clockInOut(type: 'IN' | 'OUT', location?: any): Promise<any> {
    return this.makeRequest('/attendance/clock', {
      method: 'POST',
      body: JSON.stringify({ type, location }),
    });
  }

  async getLeaveRequests(params?: any): Promise<any> {
    const queryParams = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/leave-requests/employee${queryParams}`);
  }

  async submitLeaveRequest(data: any): Promise<any> {
    return this.makeRequest('/leave-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelLeaveRequest(id: string): Promise<any> {
    return this.makeRequest(`/leave-requests/${id}/cancel`, {
      method: 'PUT',
    });
  }

  // Job application endpoints
  async getJobPostings(params?: any): Promise<any> {
    const queryParams = params ? `?${new URLSearchParams(params)}` : '';
    return this.makeRequest(`/job-postings/public${queryParams}`);
  }

  async getJobDetails(id: string): Promise<any> {
    return this.makeRequest(`/job-postings/public/${id}`);
  }

  async applyForJob(formData: FormData): Promise<any> {
    // For FormData, we need to handle multipart/form-data differently
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${this.baseURL}/candidates/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    return response.json();
  }

  async getMyApplications(): Promise<any> {
    return this.makeRequest('/candidates/my-applications');
  }

  // Dashboard endpoint
  async getDashboardData(): Promise<any> {
    return this.makeRequest('/employees/summary');
  }

  // Performance review endpoints
  async getPerformanceReviews(): Promise<any> {
    return this.makeRequest('/performance-reviews/employee');
  }

  async submitSelfReview(data: any): Promise<any> {
    return this.makeRequest('/performance-reviews/:id/self-review', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Notification endpoints
  async getNotifications(): Promise<any> {
    return this.makeRequest('/notifications');
  }

  async markNotificationRead(id: string): Promise<any> {
    return this.makeRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Payroll endpoints
  async getPayrollHistory(): Promise<any> {
    return this.makeRequest('/payroll/employee');
  }

  async getPayrollDetails(year: number, month: number): Promise<any> {
    return this.makeRequest(`/payroll/employee/${year}/${month}`);
  }

  // Department endpoints
  async getDepartments(): Promise<any> {
    return this.makeRequest('/departments');
  }

  async getDepartmentMembers(departmentId: string): Promise<any> {
    return this.makeRequest(`/departments/${departmentId}/members`);
  }
}

export default ApiService.getInstance();
