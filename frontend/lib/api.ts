const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://test.eba-r7bifc93.us-east-1.elasticbeanstalk.com/api";

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Get headers with auth token
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface SubTopic {
  subTopic: string;
  leetcodeLink?: string;
  youtubeLink?: string;
  articleLink?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  userStatus?: "pending" | "done"; // Current user's status
  _id?: string;
}

export interface Topic {
  _id: string;
  topicName: string;
  subTopics: SubTopic[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicData {
  topicName: string;
  subTopics?: SubTopic[];
}

// API client functions
export const api = {
  // Login
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }
    return response.json();
  },

  // Register
  register: async (data: CreateUserData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }
    return response.json();
  },
  // Get all users
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_URL}/users`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },

  // Get user by ID
  getUser: async (id: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },

  // Create user
  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create user");
    }
    return response.json();
  },

  // Update user
  updateUser: async (
    id: string,
    data: Partial<CreateUserData>
  ): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update user");
    }
    return response.json();
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete user");
  },

  // Get all topics
  getTopics: async (): Promise<Topic[]> => {
    const response = await fetch(`${API_URL}/topics`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch topics");
    return response.json();
  },

  // Get topic by ID
  getTopic: async (id: string): Promise<Topic> => {
    const response = await fetch(`${API_URL}/topics/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch topic");
    return response.json();
  },

  // Create topic
  createTopic: async (data: CreateTopicData): Promise<Topic> => {
    const response = await fetch(`${API_URL}/topics`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create topic");
    }
    return response.json();
  },

  // Update topic
  updateTopic: async (
    id: string,
    data: Partial<CreateTopicData>
  ): Promise<Topic> => {
    const response = await fetch(`${API_URL}/topics/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update topic");
    }
    return response.json();
  },

  // Delete topic
  deleteTopic: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/topics/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete topic");
  },

  // Update subtopic status for current user
  updateSubTopicStatus: async (
    topicId: string,
    subTopicId: string,
    status: "pending" | "done"
  ): Promise<Topic> => {
    const response = await fetch(
      `${API_URL}/topics/${topicId}/subtopics/${subTopicId}/status`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update subtopic status");
    }
    return response.json();
  },
};
