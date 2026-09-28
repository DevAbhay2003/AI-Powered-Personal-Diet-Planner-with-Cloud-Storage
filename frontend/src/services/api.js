/**
 * Centralized API Client for Cloud Computing Application
 * Manages JWT tokens, Bearer headers, REST endpoints, and error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const ROOT_URL = import.meta.env.VITE_ROOT_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("diet_cloud_token");
}

export function setToken(token) {
  if (token) {
    localStorage.setItem("diet_cloud_token", token);
  } else {
    localStorage.removeItem("diet_cloud_token");
  }
}

export function getCurrentStoredUser() {
  const u = localStorage.getItem("diet_cloud_user");
  return u ? JSON.parse(u) : null;
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem("diet_cloud_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("diet_cloud_user");
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If token expired, clear local session
    setToken(null);
    setStoredUser(null);
  }

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail || `HTTP error ${response.status}`);
  }

  // Handle blob/download vs JSON
  const contentType = response.headers.get("content-type");
  if (contentType && (contentType.includes("application/octet-stream") || contentType.includes("image/") || contentType.includes("text/plain") || contentType.includes("application/pdf"))) {
    return response.blob();
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: (name, email, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request("/auth/me"),
};

// Profile API
export const profileApi = {
  getProfile: () => request("/profile"),
  updateProfile: (profileData) =>
    request("/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
  getTargets: () => request("/profile/targets"),
};

// Diet Plans API
export const plansApi = {
  generatePlan: (params) =>
    request("/plans/generate", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  savePlan: (title, planData) =>
    request("/plans", {
      method: "POST",
      body: JSON.stringify({ title, plan_data: planData }),
    }),
  listPlans: () => request("/plans"),
  getPlan: (planId) => request(`/plans/${planId}`),
  deletePlan: (planId) =>
    request(`/plans/${planId}`, {
      method: "DELETE",
    }),
  exportPlan: (planId, format = "json") =>
    request(`/plans/${planId}/export?format=${format}`, {
      method: "POST",
    }),
};

// Cloud Object Storage API
export const filesApi = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request("/files/upload", {
      method: "POST",
      body: formData,
    });
  },
  listFiles: () => request("/files"),
  downloadFile: async (fileId, filename) => {
    const blob = await request(`/files/${fileId}/download`);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `cloud_file_${fileId}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
  deleteFile: (fileId) =>
    request(`/files/${fileId}`, {
      method: "DELETE",
    }),
};

// Daily Intake & IoT API
export const intakeApi = {
  logIntake: (intakeData) =>
    request("/intake", {
      method: "POST",
      body: JSON.stringify(intakeData),
    }),
  getDailyAnalytics: (date) =>
    request(`/intake/daily${date ? `?date=${date}` : ""}`),
  deleteIntake: (intakeId) =>
    request(`/intake/${intakeId}`, {
      method: "DELETE",
    }),
  ingestIoTScale: (uid, foodId, grams) =>
    request(`/intake/iot/ingest?uid=${uid}&food_id=${foodId}&grams=${grams}`),
};

// Cloud Infrastructure & Health API
export const cloudApi = {
  getCloudStatus: () => request(`${ROOT_URL}/cloud-status`),
  getHealth: () => request(`${ROOT_URL}/health`),
};
