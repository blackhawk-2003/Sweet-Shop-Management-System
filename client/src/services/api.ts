const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
}

export interface Sweet {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem("token") || localStorage.getItem("adminToken");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Sweets endpoints
  async getSweets(): Promise<{ sweets: Sweet[] }> {
    return this.request<{ sweets: Sweet[] }>("/sweets");
  }

  async searchSweets(params: {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ sweets: Sweet[] }> {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append("name", params.name);
    if (params.category) queryParams.append("category", params.category);
    if (params.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());

    return this.request<{ sweets: Sweet[] }>(
      `/sweets/search?${queryParams.toString()}`
    );
  }

  async createSweet(
    data: Omit<Sweet, "_id" | "createdAt" | "updatedAt">
  ): Promise<{ sweet: Sweet }> {
    return this.request<{ sweet: Sweet }>("/sweets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSweet(
    id: string,
    data: Partial<Omit<Sweet, "_id">>
  ): Promise<{ sweet: Sweet }> {
    return this.request<{ sweet: Sweet }>(`/sweets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteSweet(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/sweets/${id}`, {
      method: "DELETE",
    });
  }

  // Inventory endpoints
  async purchaseSweet(
    id: string,
    quantity: number = 1
  ): Promise<{ message: string; sweet: Sweet }> {
    return this.request<{ message: string; sweet: Sweet }>(
      `/sweets/${id}/purchase`,
      {
        method: "POST",
        body: JSON.stringify({ quantity }),
      }
    );
  }

  async restockSweet(
    id: string,
    quantity: number
  ): Promise<{ message: string; sweet: Sweet }> {
    return this.request<{ message: string; sweet: Sweet }>(
      `/sweets/${id}/restock`,
      {
        method: "POST",
        body: JSON.stringify({ quantity }),
      }
    );
  }
}

export const api = new ApiService();
