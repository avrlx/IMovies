import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
});

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('imovies_token');
  try {
    const response = await client.request({
      url: path,
      ...options,
      data: options.body,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return response.data;
  } catch (error) {
    if (!error.response) {
      throw new Error('The API is unavailable. Start MongoDB and run the backend on port 8000.');
    }
    throw new Error(error.response?.data?.message || 'Request failed');
  }
}

export const authApi = {
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => apiRequest('/auth/me'),
};
