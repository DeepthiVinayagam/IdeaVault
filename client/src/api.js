/**
 * IdeaVault API Client
 * Centralized fetch helper handling credentials, JSON payloads, and error parsing.
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // Always pass httpOnly cookies
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { error: 'Invalid server response' };
  }

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // Ideas & Analysis
  getIdeas: () => request('/ideas'),
  getIdea: (id) => request(`/ideas/${id}`),
  saveDraft: (draftData) => request('/ideas/draft', { method: 'POST', body: JSON.stringify(draftData) }),
  analyzeIdea: (ideaData) => request('/ideas/analyze', { method: 'POST', body: JSON.stringify(ideaData) }),
  deleteIdea: (id) => request(`/ideas/${id}`, { method: 'DELETE' }),

  // Projects
  getProjects: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    if (params.year) query.append('year', params.year);
    if (params.status) query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/projects${queryString}`);
  },
  getProject: (id) => request(`/projects/${id}`),
  createProject: (projectData) => request('/projects', { method: 'POST', body: JSON.stringify(projectData) }),
  updateProjectStatus: (id, status, review_notes) => 
    request(`/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, review_notes }) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // Admin Users
  getUsers: () => request('/users'),
  createUser: (userData) => request('/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUserRole: (id, updateData) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(updateData) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' })
};
