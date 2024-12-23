// frontend/src/services/api.ts

import { getAuthToken } from '../utils/auth';

const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  HEADERS: {
    'Content-Type': 'application/json',
  },
};
  
// Interface for API Response
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// Authentication Interfaces
interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  github_username?: string;
}

// Template Interfaces
interface Template {
  id: string; // UUID
  name: string;
  description: string;
  content: string;
  user_id: number;
  tex_url: string | null;
  pdf_url: string | null;
  pdf_path: string | null;
  unique_id: string;
  created_at: string;
  updated_at: string;
}

interface UploadFileResponse {
  message: string;
}

interface FinalizedResourcesResponse {
  tex_url: string;
  pdf_url: string;
}

interface CompileLatexRequest {
  content: string;
}

interface PredefinedTemplate {
  id: string;
  name: string;
  description: string;
  preview_image: string;
  content: string;
}

//Skills Interface
// Skills Interface
interface Skill {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

interface UserSkill {
  skill_id: string;
  proficiency_level: number;
  user_id: string;
}

interface ExtractedSkills {
  skills: Skill[];
  confidence_scores: Record<string, number>;
}

// Custom type for headers
type Headers = Record<string, string>;

// API Helper Functions
const getAuthHeader = () => {
  const token = getAuthToken();
  console.log('Current auth token:', token); // Add this to debug

  if (!token) {
    console.warn('No auth token found!');
  }

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
    console.log('API Service initialized with base URL:', this.baseUrl);
  }

  public static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }

  // =======================
  // Authentication APIs
  // =======================
  async login(data: LoginData): Promise<ApiResponse<LoginResponse>> {
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
  
    const result = await handleResponse<LoginResponse>(response);
    
    // Now TypeScript knows that result.data might have access_token
    if (result.data && result.data.access_token) {
      localStorage.setItem('auth_token', result.data.access_token);
    }
  
    return result;
  }
  

  async register(data: RegisterData): Promise<ApiResponse<any>> {
    return handleResponse(await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(data),
    }));
  }

  // =======================
  // User APIs
  // =======================
  async getCurrentUser(): Promise<ApiResponse<any>> {
    const headers = getAuthHeader();
    const response = await fetch(`${this.baseUrl}/users/me`, {
      headers,
    });

    return handleResponse(response);
  }

  // =======================
  // Template APIs
  // =======================

  /**
   * Upload a LaTeX template
   */
  async uploadTemplate(file: File): Promise<ApiResponse<Template>> {
    const formData = new FormData();
    formData.append('file', file);
  
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Authorization': token ? `Bearer ${token}` : ''
    };
  
    console.log('Upload headers:', headers);
  
    return handleResponse(await fetch(`${this.baseUrl}/templates/upload`, {
      method: 'POST',
      headers: headers,
      body: formData,
    }));
  }

  /**
   * Get the current user's template
   */
  async getUserTemplate(): Promise<ApiResponse<Template>> {
    return handleResponse(await fetch(`${this.baseUrl}/templates/my-template`, {
      headers: getAuthHeader(),
    }));
  }

  /**
   * Preview a PDF for the user's template
   */
  async previewTemplate(uniqueId: string): Promise<ApiResponse<Blob>> {
    const response = await fetch(`${this.baseUrl}/templates/preview?unique_id=${uniqueId}`, {
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      return {
        error: 'Unable to preview PDF',
        status: response.status,
      };
    }

    const blob = await response.blob();
    return {
      data: blob,
      status: response.status,
    };
  }

  /**
   * Finalize the user's template by uploading to Cloudinary
   */
  async finalizeTemplate(): Promise<ApiResponse<Template>> {
    return handleResponse(await fetch(`${this.baseUrl}/templates/finalize`, {
      method: 'POST',
      headers: getAuthHeader(),
    }));
  }

  /**
   * Delete the user's template (also deletes from Cloudinary)
   */
  async deleteTemplate(templateId: string): Promise<ApiResponse<UploadFileResponse>> {
    return handleResponse(await fetch(`${this.baseUrl}/templates/${templateId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    }));
  }

  /**
   * Get the finalized PDF and TEX URLs
   */
  async getFinalizedResources(): Promise<ApiResponse<FinalizedResourcesResponse>> {
    return handleResponse(await fetch(`${this.baseUrl}/templates/finalized-resources`, {
      headers: getAuthHeader(),
    }));
  }


  async compileLaTeX(data: CompileLatexRequest): Promise<ApiResponse<Blob>> {
    const response = await fetch(`${this.baseUrl}/resumes/compile`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      return {
        error: await response.text(),
        status: response.status,
      };
    }
  
    const blob = await response.blob();
    return {
      data: blob,
      status: response.status,
    };
  }
  
  async getPredefinedTemplates(): Promise<ApiResponse<PredefinedTemplate[]>> {
    return handleResponse(await fetch(`${this.baseUrl}/templates/predefined`, {
      headers: getAuthHeader(),
    }));
  }

  // =======================
  // Skills APIs
  // =======================
  /**
   * Search for skills in the database
   * @param query Search query string
   */
  async searchSkills(query: string): Promise<ApiResponse<Skill[]>> {
    console.log('Searching skills with query:', query);
    try {
      const response = await fetch(`${this.baseUrl}/skills/skills?query=${encodeURIComponent(query)}`, {
        headers: getAuthHeader(),
      });
      const result = await handleResponse<Skill[]>(response);
      console.log('Search skills result:', result);
      return result;
    } catch (error) {
      console.error('Error searching skills:', error);
      return {
        error: 'Failed to search skills',
        status: 500,
      };
    }
  }

  /**
   * Extract skills from resume content
   * @param content Resume content or file
   */
  async extractSkills(content: string): Promise<ApiResponse<ExtractedSkills>> {
    console.log('Extracting skills from resume content');
    try {
      const response = await fetch(`${this.baseUrl}/skills/skills/extract`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ content }),
      });
      const result = await handleResponse<ExtractedSkills>(response);
      console.log('Extracted skills:', result);
      return result;
    } catch (error) {
      console.error('Error extracting skills:', error);
      return {
        error: 'Failed to extract skills',
        status: 500,
      };
    }
  }

  /**
   * Add a skill to user's profile
   * @param skillData User skill data including skill_id and proficiency_level
   */
  async addUserSkill(skillData: UserSkill): Promise<ApiResponse<any>> {
    console.log('Adding user skill:', skillData);
    try {
      const response = await fetch(`${this.baseUrl}/skills/user-skills`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(skillData),
      });
      const result = await handleResponse(response);
      console.log('Add user skill result:', result);
      return result;
    } catch (error) {
      console.error('Error adding user skill:', error);
      return {
        error: 'Failed to add user skill',
        status: 500,
      };
    }
  }


  // =======================
  // Generic Request Method
  // =======================
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