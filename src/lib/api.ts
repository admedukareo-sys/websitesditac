const rawApiUrl = (import.meta.env.VITE_API_URL || '/api/index.php').trim();
const API_BASE = rawApiUrl.endsWith('.php') 
  ? rawApiUrl 
  : `${rawApiUrl.replace(/\/+$/, '')}/index.php`;

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('sdit_auth_token') || null;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('sdit_auth_token', token);
    } else {
      localStorage.removeItem('sdit_auth_token');
    }
  } catch {}
}

async function apiRequest<T = any>(action: string, data?: any): Promise<T | null> {
  try {
    const url = `${API_BASE}?action=${action}`;
    const token = getAuthToken();
    const headers: Record<string, string> = {};

    if (data && !(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options: RequestInit = data
      ? {
          method: 'POST',
          headers,
          body: data instanceof FormData ? data : JSON.stringify(data),
        }
      : {
          method: 'GET',
          headers,
        };

    const res = await fetch(url, options);
    if (!res.ok) return null;
    const json = await res.json();

    if (json && json.token) {
      setAuthToken(json.token);
    }

    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.warn(`[API Client] Failed to fetch action "${action}":`, err);
    return null;
  }
}

export const api = {
  ping: async () => {
    return apiRequest('ping');
  },

  getUsers: async () => {
    return apiRequest('get_users');
  },

  saveUser: async (user: any) => {
    return apiRequest('save_user', user);
  },

  deleteUser: async (id: number) => {
    return apiRequest('delete_user', { id });
  },

  login: async (email: string, password: string) => {
    return apiRequest('login', { email, password });
  },

  googleAuth: async (name: string, email: string, googleId?: string) => {
    return apiRequest('google_auth', { name, email, googleId });
  },

  getSettings: async () => {
    return apiRequest('get_settings');
  },

  saveSettings: async (settings: any) => {
    return apiRequest('save_settings', settings);
  },

  getRegistrations: async () => {
    return apiRequest('get_registrations');
  },

  saveRegistration: async (regData: any) => {
    return apiRequest('save_registration', regData);
  },

  deleteRegistration: async (id: number) => {
    return apiRequest('delete_registration', { id });
  },

  getTeachers: async () => {
    return apiRequest('get_teachers');
  },

  saveTeachers: async (teachers: any[]) => {
    return apiRequest('save_teachers', teachers);
  },

  getCurriculum: async () => {
    return apiRequest('get_curriculum');
  },

  saveCurriculum: async (curriculum: any[]) => {
    return apiRequest('save_curriculum', curriculum);
  },

  getActivities: async () => {
    return apiRequest('get_activities');
  },

  saveActivities: async (activities: any[]) => {
    return apiRequest('save_activities', activities);
  },

  getFacilities: async () => {
    return apiRequest('get_facilities');
  },

  saveFacilities: async (facilities: any[]) => {
    return apiRequest('save_facilities', facilities);
  },

  getTestimonials: async () => {
    return apiRequest('get_testimonials');
  },

  saveTestimonials: async (testimonials: any[]) => {
    return apiRequest('save_testimonials', testimonials);
  },

  getSlides: async () => {
    return apiRequest('get_slides');
  },

  saveSlides: async (slides: any[]) => {
    return apiRequest('save_slides', slides);
  },

  getNews: async () => {
    return apiRequest('get_news');
  },

  saveNews: async (news: any[]) => {
    return apiRequest('save_news', news);
  },

  getEvents: async () => {
    return apiRequest('get_events');
  },

  saveEvents: async (events: any[]) => {
    return apiRequest('save_events', events);
  },

  getVisitorLogs: async () => {
    return apiRequest('get_visitor_logs');
  },

  saveVisitorLog: async (log: any) => {
    return apiRequest('save_visitor_log', log);
  },

  getAdvantages: async () => {
    return apiRequest('get_advantages');
  },

  saveAdvantages: async (advantages: any[]) => {
    return apiRequest('save_advantages', advantages);
  },

  uploadFile: async (file: File | Blob, category = 'spmb'): Promise<{ success: boolean; url: string; message?: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const url = `${API_BASE}?action=upload_file`;
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        return { success: false, url: '', message: `Server HTTP error: ${res.status}` };
      }

      const json = await res.json();
      if (json.status === 'success' && json.url) {
        return { success: true, url: json.url };
      }
      return { success: false, url: '', message: json.message || 'Gagal mengunggah file' };
    } catch (err: any) {
      console.warn('[API Client] uploadFile via FormData failed, trying base64 fallback:', err);
      // Fallback: convert file to Base64 and send as JSON if multipart fetch was blocked
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res2: any = await apiRequest('upload_file', { file: base64, category });
        if (res2 && res2.url) {
          return { success: true, url: res2.url };
        }
        return { success: false, url: '', message: res2?.message || 'Gagal mengunggah' };
      } catch (e: any) {
        return { success: false, url: '', message: err.message || 'Koneksi ke server gagal' };
      }
    }
  },
};
