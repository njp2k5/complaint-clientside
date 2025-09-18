// Backend API Configuration
export const API_BASE_URL = "https://complaint-serverside.onrender.com/"; // 👈 no trailing slash

// API Endpoints
export const API_ENDPOINTS = {
  // Student endpoints
  STUDENT_LOGIN: "/login/student",   // 👈 fixed
  STUDENT_COMPLAINTS: "/student/complaints",
  STUDENT_COMPLAINT_BY_ID: (id: string) => `/student/complaints/${id}`,
  
  // Admin endpoints
  ADMIN_LOGIN: "/login/admin",       // 👈 fixed
  ADMIN_COMPLAINTS: "/admin/complaints", 
  ADMIN_REPORT: "/admin/report",
  ADMIN_UPDATE_COMPLAINT: (id: string) => `/admin/complaints/${id}`,
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};
