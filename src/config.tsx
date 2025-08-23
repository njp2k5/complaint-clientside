// Backend API Configuration
// Replace this URL with your deployed Python backend URL
export const API_BASE_URL = "https://your-backend-url.com/api";

// API Endpoints
export const API_ENDPOINTS = {
  // Student endpoints
  STUDENT_LOGIN: "/student/login",
  STUDENT_COMPLAINTS: "/student/complaints",
  STUDENT_COMPLAINT_BY_ID: (id: string) => `/student/complaints/${id}`,
  
  // Admin endpoints
  ADMIN_LOGIN: "/admin/login",
  ADMIN_COMPLAINTS: "/admin/complaints", 
  ADMIN_REPORT: "/admin/report",
  ADMIN_UPDATE_COMPLAINT: (id: string) => `/admin/complaints/${id}`,
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};