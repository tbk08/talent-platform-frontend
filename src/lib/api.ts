// API client wrapper for IT Talent Platform Karakalpakstan
const BASE_URL = "http://localhost:8000/api";

function getHeaders(token?: string | null) {
  const headers: Record<string, string> = {};
  if (!(arguments[0] instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  if (activeToken) {
    headers["Authorization"] = `Bearer ${activeToken}`;
  }
  return headers;
}

export const api = {
  // Auth
  auth: {
    async register(data: any) {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Registration failed");
      }
      return res.json();
    },
    async login(data: any) {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Login failed");
      }
      const result = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("token", result.access_token);
        localStorage.setItem("role", result.role);
        localStorage.setItem("user_id", String(result.user_id));
        localStorage.setItem("name", result.name);
      }
      return result;
    },
    logout() {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user_id");
        localStorage.removeItem("name");
      }
    },
    getCurrentUser() {
      if (typeof window === "undefined") return null;
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const user_id = localStorage.getItem("user_id");
      const name = localStorage.getItem("name");
      if (!token) return null;
      return { token, role, user_id: Number(user_id), name };
    }
  },

  // Candidate Profile
  profile: {
    async get() {
      const res = await fetch(`${BASE_URL}/profile`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
    async update(data: any) {
      const res = await fetch(`${BASE_URL}/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    async uploadCV(formData: FormData) {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${BASE_URL}/profile/upload-cv`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to upload CV");
      }
      return res.json();
    }
  },

  // Companies
  companies: {
    async list() {
      const res = await fetch(`${BASE_URL}/companies`);
      if (!res.ok) throw new Error("Failed to load companies");
      return res.json();
    },
    async listPending() {
      const res = await fetch(`${BASE_URL}/companies/pending`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load pending companies");
      return res.json();
    },
    async verify(id: number) {
      const res = await fetch(`${BASE_URL}/companies/${id}/verify`, {
        method: "POST",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to verify company");
      return res.json();
    },
    async getMy() {
      const res = await fetch(`${BASE_URL}/companies/my`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load company profile");
      return res.json();
    },
    async updateMy(data: any) {
      const res = await fetch(`${BASE_URL}/companies/my`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update company profile");
      return res.json();
    }
  },

  // Jobs
  jobs: {
    async list(filters: { q?: string; city?: string; type?: string; experience_level?: string; skills?: string } = {}) {
      const params = new URLSearchParams();
      if (filters.q) params.append("q", filters.q);
      if (filters.city) params.append("city", filters.city);
      if (filters.type) params.append("type", filters.type);
      if (filters.experience_level) params.append("experience_level", filters.experience_level);
      if (filters.skills) params.append("skills", filters.skills);

      const res = await fetch(`${BASE_URL}/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load jobs");
      return res.json();
    },
    async listMy() {
      const res = await fetch(`${BASE_URL}/jobs/my`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load your company's jobs");
      return res.json();
    },
    async get(id: number) {
      const res = await fetch(`${BASE_URL}/jobs/${id}`);
      if (!res.ok) throw new Error("Job not found");
      return res.json();
    },
    async create(data: any) {
      const res = await fetch(`${BASE_URL}/jobs`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to create job");
      }
      return res.json();
    },
    async update(id: number, data: any) {
      const res = await fetch(`${BASE_URL}/jobs/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update job");
      return res.json();
    },
    async apply(jobId: number, data: { cover_letter?: string }) {
      const res = await fetch(`${BASE_URL}/jobs/${jobId}/apply`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to apply for job");
      }
      return res.json();
    },
    async getApplications(jobId: number) {
      const res = await fetch(`${BASE_URL}/jobs/${jobId}/applications`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load applicants");
      return res.json();
    }
  },

  // Applications (Candidate perspective)
  applications: {
    async listMy() {
      const res = await fetch(`${BASE_URL}/applications`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load applications");
      return res.json();
    },
    async updateStatus(id: number, status: string) {
      const res = await fetch(`${BASE_URL}/applications/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update application status");
      return res.json();
    }
  },

  // Robotics Talent Hub
  robotics: {
    async list() {
      const res = await fetch(`${BASE_URL}/projects`);
      if (!res.ok) throw new Error("Failed to load robotics projects");
      return res.json();
    },
    async create(data: any) {
      const res = await fetch(`${BASE_URL}/projects`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post robotics project");
      return res.json();
    }
  },

  // Startup Team Builder
  startups: {
    async list() {
      const res = await fetch(`${BASE_URL}/team-requests`);
      if (!res.ok) throw new Error("Failed to load team requests");
      return res.json();
    },
    async create(data: any) {
      const res = await fetch(`${BASE_URL}/team-requests`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post team request");
      return res.json();
    }
  },

  // Internships
  internships: {
    async list(filters: { program_type?: string; city?: string } = {}) {
      const params = new URLSearchParams();
      if (filters.program_type) params.append("program_type", filters.program_type);
      if (filters.city) params.append("city", filters.city);

      const res = await fetch(`${BASE_URL}/internships?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load internships");
      return res.json();
    },
    async create(data: any) {
      const res = await fetch(`${BASE_URL}/internships`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post internship");
      return res.json();
    }
  },

  // AI Analytics & Recommendations
  analytics: {
    async getMarket() {
      const res = await fetch(`${BASE_URL}/analytics/market`);
      if (!res.ok) throw new Error("Failed to load market analytics");
      return res.json();
    },
    async getAIRecommendations() {
      const res = await fetch(`${BASE_URL}/analytics/recommender`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load AI recommendations");
      return res.json();
    }
  }
};
