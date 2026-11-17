// LIFE OS API Client
const BASE_URL = '/api';

export async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options;
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // sends cookies
    ...rest,
  };

  if (body && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    delete config.headers['Content-Type'];
    config.body = body;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
  demoLogin: () => apiRequest('/auth/demo-login', { method: 'POST' }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
  updateSettings: (settings) => apiRequest('/auth/settings', { method: 'PUT', body: settings }),

  // AI & Voice
  chat: (payload) => apiRequest('/ai/chat', { method: 'POST', body: payload }),
  getConversations: () => apiRequest('/ai/conversations'),
  getBriefing: () => apiRequest('/ai/briefing'),
  previewAction: (payload) => apiRequest('/ai/preview-action', { method: 'POST', body: payload }),
  confirmAction: (payload) => apiRequest('/ai/confirm-action', { method: 'POST', body: payload }),

  // Tasks & Planner
  getTasks: (params = '') => apiRequest(`/tasks${params ? `?${params}` : ''}`),
  createTask: (task) => apiRequest('/tasks', { method: 'POST', body: task }),
  updateTask: (id, task) => apiRequest(`/tasks/${id}`, { method: 'PUT', body: task }),
  toggleTask: (id) => apiRequest(`/tasks/${id}/toggle`, { method: 'PATCH' }),
  deleteTask: (id) => apiRequest(`/tasks/${id}`, { method: 'DELETE' }),
  getSchedule: (start, end) => apiRequest(`/planner/schedule?start=${start}&end=${end}`),
  createEvent: (event) => apiRequest('/planner/events', { method: 'POST', body: event }),
  deleteEvent: (id) => apiRequest(`/planner/events/${id}`, { method: 'DELETE' }),

  // Student Life
  getStudentProfile: () => apiRequest('/student/profile'),
  updateStudentProfile: (profile) => apiRequest('/student/profile', { method: 'POST', body: profile }),
  getTimetable: () => apiRequest('/student/timetable'),
  updateTimetableSlot: (slot) => apiRequest('/student/timetable', { method: 'POST', body: slot }),
  deleteTimetableSlot: (id) => apiRequest(`/student/timetable/${id}`, { method: 'DELETE' }),
  getAttendance: () => apiRequest('/student/attendance'),
  logAttendance: (record) => apiRequest('/student/attendance/log', { method: 'POST', body: record }),
  getAssignments: () => apiRequest('/student/assignments'),
  createAssignment: (assignment) => apiRequest('/student/assignments', { method: 'POST', body: assignment }),
  updateAssignment: (id, data) => apiRequest(`/student/assignments/${id}`, { method: 'PUT', body: data }),
  getPerformance: () => apiRequest('/student/performance'),
  calculateWhatIfGPA: (payload) => apiRequest('/student/performance/what-if', { method: 'POST', body: payload }),

  // Academic Notes & Question Papers
  generateAcademicNotes: (payload) => apiRequest('/academic/generate-notes', { method: 'POST', body: payload }),
  getAcademicNotes: (id) => apiRequest(`/academic/notes/${id}`),
  searchQuestionPapers: (query) => apiRequest(`/academic/question-papers?${new URLSearchParams(query).toString()}`),
  analyzePaperIntelligence: (subject) => apiRequest('/academic/question-papers/analyze', { method: 'POST', body: { subject } }),
  askStudyBuddy: (payload) => apiRequest('/academic/study-buddy/ask', { method: 'POST', body: payload }),

  // Contacts & Birthday Automation
  getContacts: () => apiRequest('/contacts'),
  createContact: (contact) => apiRequest('/contacts', { method: 'POST', body: contact }),
  updateContact: (id, contact) => apiRequest(`/contacts/${id}`, { method: 'PUT', body: contact }),
  deleteContact: (id) => apiRequest(`/contacts/${id}`, { method: 'DELETE' }),
  generateBirthdayWish: (id, options) => apiRequest(`/contacts/${id}/generate-wish`, { method: 'POST', body: options }),
  scheduleBirthdayEmail: (id, settings) => apiRequest(`/contacts/${id}/schedule-automation`, { method: 'POST', body: settings }),
  getBirthdayHistory: () => apiRequest('/contacts/history'),

  // Personal Memory & Universal Capture
  getMemories: (search = '') => apiRequest(`/memory${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createMemory: (memory) => apiRequest('/memory', { method: 'POST', body: memory }),
  updateMemory: (id, memory) => apiRequest(`/memory/${id}`, { method: 'PUT', body: memory }),
  deleteMemory: (id) => apiRequest(`/memory/${id}`, { method: 'DELETE' }),
  universalCapture: (payload) => apiRequest('/capture', { method: 'POST', body: payload }),

  // Goals & Habits
  getGoals: () => apiRequest('/goals'),
  createGoal: (goal) => apiRequest('/goals', { method: 'POST', body: goal }),
  updateGoal: (id, goal) => apiRequest(`/goals/${id}`, { method: 'PUT', body: goal }),
  deleteGoal: (id) => apiRequest(`/goals/${id}`, { method: 'DELETE' }),
  logHabit: (id, date) => apiRequest(`/goals/${id}/habit-log`, { method: 'POST', body: { date } }),

  // Subscriptions & Bills
  getSubscriptions: () => apiRequest('/subscriptions'),
  createSubscription: (sub) => apiRequest('/subscriptions', { method: 'POST', body: sub }),
  deleteSubscription: (id) => apiRequest(`/subscriptions/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'POST' }),
  snoozeNotification: (id, minutes) => apiRequest(`/notifications/${id}/snooze`, { method: 'POST', body: { minutes } }),

  // Integrations & Google OAuth
  getGoogleAuthUrl: () => apiRequest('/integrations/google/auth-url'),
  getGoogleStatus: () => apiRequest('/integrations/google/status'),
  disconnectGoogle: () => apiRequest('/integrations/google/disconnect', { method: 'POST' })
};
