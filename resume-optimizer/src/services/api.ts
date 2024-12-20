// frontend/src/services/api.ts
import { getAuthToken } from '../utils/auth';

const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  HEADERS: {
    'Content-Type': 'application/json',
  },
};
  
  // Interface for API Response
  interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    status: number;
  }
  
  // Authentication Interfaces
  interface LoginData {
    username: string;
    password: string;
  }
  
  interface RegisterData {
    email: string;
    password: string;
    full_name?: string;
    github_username?: string;
  }
  
  // Custom type for headers
  type Headers = Record<string, string>;
  
  // API Helper Functions
  const getAuthHeader = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };
  
  const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      return {
        error: error?.detail || 'An error occurred',
        status: response.status,
      };
    }
  
    const data = await response.json();
    return {
      data,
      status: response.status,
    };
  };
  
  // API Class
  export class Api {
    private static instance: Api;
    private baseUrl: string;
  
    private constructor() {
      this.baseUrl = API_CONFIG.BASE_URL;
    }
  
    public static getInstance(): Api {
      if (!Api.instance) {
        Api.instance = new Api();
      }
      return Api.instance;
    }
  
    // Authentication APIs
    async login(data: LoginData): Promise<ApiResponse<any>> {
        const formData = new URLSearchParams();
        formData.append('username', data.username);
        formData.append('password', data.password);
    
        const response = await fetch(`${this.baseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });
    
        return handleResponse(response);
      }
  
    async register(data: RegisterData): Promise<ApiResponse<any>> {
      return handleResponse(await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(data),
      }));
    }
  
    // User APIs
    async getCurrentUser(): Promise<ApiResponse<any>> {
        const headers = getAuthHeader();
        const response = await fetch(`${this.baseUrl}/users/me`, {
          headers,
        });
    
        return handleResponse(response);
      }
  
    // Skills APIs
    async getUserSkills(): Promise<ApiResponse<any>> {
      return handleResponse(await fetch(`${this.baseUrl}/skills/my-skills`, {
        headers: getAuthHeader(),
      }));
    }
  
    async addSkill(skillData: any): Promise<ApiResponse<any>> {
      return handleResponse(await fetch(`${this.baseUrl}/skills/`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(skillData),
      }));
    }
  
    // Templates APIs
    async getUserTemplates(): Promise<ApiResponse<any>> {
      return handleResponse(await fetch(`${this.baseUrl}/templates/my-templates`, {
        headers: getAuthHeader(),
      }));
    }
  
    async uploadTemplate(templateData: FormData): Promise<ApiResponse<any>> {
      const headers = getAuthHeader();
      delete headers['Content-Type']; // Let the browser set the content type for FormData
  
      return handleResponse(await fetch(`${this.baseUrl}/templates/upload`, {
        method: 'POST',
        headers: {
          'Authorization': headers.Authorization,
        },
        body: templateData,
      }));
    }
  
    // Resumes APIs
    async generateResume(data: any): Promise<ApiResponse<any>> {
      return handleResponse(await fetch(`${this.baseUrl}/resumes/generate`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      }));
    }
  
    async getUserResumes(): Promise<ApiResponse<any>> {
      return handleResponse(await fetch(`${this.baseUrl}/resumes/my-resumes`, {
        headers: getAuthHeader(),
      }));
    }
  
    // Generic request method
    async request<T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        ...getAuthHeader(),
        ...(options.headers as Headers),
      };
  
      return handleResponse<T>(await fetch(url, {
        ...options,
        headers,
      }));
    }
  }
  
  // Export singleton instance
  export const api = Api.getInstance();