import { getAuthToken } from '../utils/auth';

const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Interface for API Response
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// Authentication Interfaces
export interface LoginData {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  github_username?: string;
}

// Skills Interfaces
export type SkillCategory = 'soft' | 'technical' | 'hard';

export interface Skill {
  id: number;
  name: string;
  category: SkillCategory;
  source?: string;
}

export interface UserSkill {
  id: number;
  skill_id: number;
  rating: number;
  skill: Skill;
}

export interface SkillWithRating {
  name: string;
  rating: number;
  isFromResume?: boolean; 
}

export interface BatchSkillsByCategory {
  hard_skills: SkillWithRating[];
  soft_skills: SkillWithRating[];
  technical_skills: SkillWithRating[];
}

export interface SingleSkillCreate {
  name: string;
  rating: number;
  category: SkillCategory;
}

// Template Interfaces
export interface Template {
  id: string;
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

export interface UploadFileResponse {
  message: string;
}

export interface FinalizedResourcesResponse {
  tex_url: string;
  pdf_url: string;
}

export interface CompileLatexRequest {
  content: string;
}

export interface PredefinedTemplate {
  id: string;
  name: string;
  description: string;
  preview_image: string;
  content: string;
}

// Profile Types (if you are using an enum for profile_type)
export enum ProfileType {
  ACADEMIC = 'ACADEMIC',
  PROFESSIONAL = 'PROFESSIONAL',
}

// Represents the data needed to create or update a user profile
export interface UserProfileCreate {
  profile_type?: ProfileType; // adjust fields as needed
  headline?: string;
  bio?: string;
  // add additional fields that your backend expects
}

// Represents the user profile returned from the backend
export interface UserProfile {
  id: string;
  user_id: number;
  profile_type?: ProfileType;
  headline?: string;
  bio?: string;
  // any other fields on your UserProfile model
}

// Represents the data needed to create a work experience entry
export interface WorkExperienceCreate {
  position: string;
  company_name: string;
  start_date: string; // or Date if you convert
  end_date?: string;  // or Date if you convert
  description?: string;
  // any other fields your backend expects
}

// Represents the work experience returned from the backend
export interface WorkExperience {
  id: string;
  profile_id: string;
  position: string;
  company_name: string;
  start_date: string;
  end_date?: string;
  description?: string;
  // any other fields on your WorkExperience model
}

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

  // User APIs
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return handleResponse(await fetch(`${this.baseUrl}/users/me`, {
      headers: getAuthHeader(),
    }));
  }

  // Template APIs
  async uploadTemplate(file: File): Promise<ApiResponse<Template>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers: HeadersInit = {
      'Authorization': getAuthToken() ? `Bearer ${getAuthToken()}` : ''
    };
    
    return handleResponse(await fetch(`${this.baseUrl}/templates/upload`, {
      method: 'POST',
      headers: headers,
      body: formData,
    }));
  }

  async getUserTemplate(): Promise<ApiResponse<Template>> {
    return handleResponse(await fetch(`${this.baseUrl}/templates/my-template`, {
      headers: getAuthHeader(),
    }));
  }

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

  async finalizeTemplate(): Promise<ApiResponse<Template>> {
    return handleResponse(await fetch(`${this.baseUrl}/templates/finalize`, {
      method: 'POST',
      headers: getAuthHeader(),
    }));
  }

  async deleteTemplate(templateId: string): Promise<ApiResponse<UploadFileResponse>> {
    return handleResponse(await fetch(`${this.baseUrl}/templates/${templateId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    }));
  }

  async getFinalizedResources(): Promise<ApiResponse<FinalizedResourcesResponse>> {
    return handleResponse(await fetch(`${this.baseUrl}/templates/finalized-resources`, {
      headers: getAuthHeader(),
    }));
  }

  async compileLaTeX(data: CompileLatexRequest): Promise<ApiResponse<Blob>> {
    const response = await fetch(`${this.baseUrl}/resumes/compile`, {
      method: 'POST',
      headers: getAuthHeader(),
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

  // Updated Skills APIs
  async searchSkills(query: string): Promise<ApiResponse<Skill[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/skills/skills?query=${encodeURIComponent(query)}`,
        { headers: getAuthHeader() }
      );
      return handleResponse<Skill[]>(response);
    } catch (error) {
      return {
        error: 'Failed to search skills',
        status: 500,
      };
    }
  }

  async extractSkillsFromFile(file: File): Promise<ApiResponse<Skill[]>> {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', file, file.name);
  
      // Build our own headers. We do NOT set 'Content-Type'
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
  
      const response = await fetch(`${this.baseUrl}/skills/skills/extract`, {
        method: 'POST',
        headers,
        body: formData,
      });
  
      return handleResponse<Skill[]>(response);
    } catch (error) {
      return {
        error: 'Failed to extract skills',
        status: 500,
      };
    }
  }

  async extractSkills(resumeContent: string): Promise<ApiResponse<Skill[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/skills/skills/extract`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ resume_content: resumeContent }),
      });
      return handleResponse<Skill[]>(response);
    } catch (error) {
      return {
        error: 'Failed to extract skills',
        status: 500,
      };
    }
  }

  async getUserSkills(): Promise<ApiResponse<UserSkill[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/skills/user-skills/me`, {
        headers: getAuthHeader(),
      });
      return handleResponse<UserSkill[]>(response);
    } catch (error) {
      return {
        error: 'Failed to get user skills',
        status: 500,
      };
    }
  }

  async addSingleUserSkill(skillData: SingleSkillCreate): Promise<ApiResponse<UserSkill>> {
    try {
      const response = await fetch(`${this.baseUrl}/skills/user-skills/single`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(skillData),
      });
      return handleResponse<UserSkill>(response);
    } catch (error) {
      return {
        error: 'Failed to add skill',
        status: 500,
      };
    }
  }
  
  async saveBatchSkills(skills: BatchSkillsByCategory): Promise<ApiResponse<UserSkill[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/skills/user-skills/batch`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(skills),
      });
      return handleResponse<UserSkill[]>(response);
    } catch (error) {
      return {
        error: 'Failed to save skills batch',
        status: 500,
      };
    }
  }

  /**
   * Create or update user profile setting (Academic/Professional)
   * POST /profile/setting
   */
  async createOrUpdateProfileSetting(
    profile: UserProfileCreate
  ): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/profile/setting`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(profile),
      });

      return handleResponse<UserProfile>(response);
    } catch (error) {
      return {
        error: 'Failed to create or update profile setting',
        status: 500,
      };
    }
  }

  /**
   * Add a new work experience entry
   * POST /profile/experience
   */
  async addWorkExperience(
    experience: WorkExperienceCreate
  ): Promise<ApiResponse<WorkExperience>> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/profile/experience`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(experience),
      });

      return handleResponse<WorkExperience>(response);
    } catch (error) {
      return {
        error: 'Failed to add work experience',
        status: 500,
      };
    }
  }

  /**
   * Add multiple work experiences at once
   * POST /profile/experiences/bulk
   */
  async addWorkExperiencesBulk(
    experiences: WorkExperienceCreate[]
  ): Promise<ApiResponse<WorkExperience[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/profile/experiences/bulk`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(experiences),
      });

      return handleResponse<WorkExperience[]>(response);
    } catch (error) {
      return {
        error: 'Failed to add work experiences in bulk',
        status: 500,
      };
    }
  }

  /**
   * Get all work experiences for current user
   * GET /profile/experiences
   */
  async getWorkExperiences(): Promise<ApiResponse<WorkExperience[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/profile/experiences`, {
        headers: getAuthHeader(),
      });

      return handleResponse<WorkExperience[]>(response);
    } catch (error) {
      return {
        error: 'Failed to get work experiences',
        status: 500,
      };
    }
  }

  /**
   * Get a specific work experience entry
   * GET /profile/experience/{experience_id}
   */
  async getWorkExperience(
    experienceId: string
  ): Promise<ApiResponse<WorkExperience>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/profile/profile/experience/${experienceId}`,
        {
          headers: getAuthHeader(),
        }
      );

      return handleResponse<WorkExperience>(response);
    } catch (error) {
      return {
        error: 'Failed to get work experience',
        status: 500,
      };
    }
  }

  /**
   * Update a work experience entry
   * PUT /profile/experience/{experience_id}
   */
  async updateWorkExperience(
    experienceId: string,
    updatedExperience: WorkExperienceCreate
  ): Promise<ApiResponse<WorkExperience>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/profile/profile/experience/${experienceId}`,
        {
          method: 'PUT',
          headers: getAuthHeader(),
          body: JSON.stringify(updatedExperience),
        }
      );

      return handleResponse<WorkExperience>(response);
    } catch (error) {
      return {
        error: 'Failed to update work experience',
        status: 500,
      };
    }
  }

  /**
   * Delete a work experience entry
   * DELETE /profile/experience/{experience_id}
   */
  async deleteWorkExperience(
    experienceId: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/profile/profile/experience/${experienceId}`,
        {
          method: 'DELETE',
          headers: getAuthHeader(),
        }
      );

      return handleResponse<{ message: string }>(response);
    } catch (error) {
      return {
        error: 'Failed to delete work experience',
        status: 500,
      };
    }
  }

  // Generic Request Method
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