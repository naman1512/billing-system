// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Helper function to make authenticated requests
const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('Making API request to:', fullUrl, 'with method:', config.method);

  try {
    const response = await fetch(fullUrl, config);
    console.log('API response status:', response.status, response.statusText);
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (jsonErr) {
        errorData = { error: { message: response.statusText || 'Request failed' } };
      }
      console.error('API Error:', errorData);
      throw new Error(errorData.error?.message || 'Request failed');
    }
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown API error');
    }
  }
};

// Helper function for file uploads
const apiUpload = async (
  endpoint: string,
  formData: FormData
): Promise<any> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Upload Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (userData: { email: string; password: string; name?: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getProfile: () => apiRequest('/auth/profile'),
};

// Companies API
export const companiesAPI = {
  getAll: () => apiRequest('/companies'),

  getById: (id: string) => apiRequest(`/companies/${id}`),

  create: (companyData: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    addressLine3?: string;
    gstNumbers: string[];
    rentedArea: number;
    rentRate: number;
    sgstRate?: number;
    cgstRate?: number;
    refNumberPrefix?: string;
  }) =>
    apiRequest('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    }),

  update: (id: string, companyData: any) =>
    apiRequest(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    }),

  delete: (id: string) =>
    apiRequest(`/companies/${id}`, {
      method: 'DELETE',
    }),

  getInvoices: (id: string) => apiRequest(`/companies/${id}/invoices`),
};

// Invoices API
export const invoicesAPI = {
  getAll: (params?: {
    companyId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.companyId) queryParams.append('companyId', params.companyId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    return apiRequest(`/invoices${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/invoices/${id}`),

  create: (invoiceData: {
    companyId: string;
    refNumber: string;
    amount: number;
    rentDescription?: string;
    dueDate?: string;
    emailRecipient?: string;
    status?: string;
  }, pdfFile?: File) => {
    if (pdfFile) {
      const formData = new FormData();
      Object.entries(invoiceData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      formData.append('pdf', pdfFile);
      return apiUpload('/invoices', formData);
    } else {
      return apiRequest('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      });
    }
  },

  update: (id: string, invoiceData: any) =>
    apiRequest(`/invoices?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    }),

  delete: (id: string) =>
    apiRequest(`/invoices/${id}`, {
      method: 'DELETE',
    }),
};

// Auth helper functions
export const authHelpers = {
  saveToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },
  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },
};

const api = {
  auth: authAPI,
  companies: companiesAPI,
  invoices: invoicesAPI,
  helpers: authHelpers,
};
export default api;
