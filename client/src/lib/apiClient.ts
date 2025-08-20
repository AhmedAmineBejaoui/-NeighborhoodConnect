import { useAuthStore } from "./store";

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { accessToken } = useAuthStore.getState();
    
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      credentials: "include",
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || "Une erreur est survenue";
      } catch {
        errorMessage = errorText || response.statusText;
      }

      throw new Error(`${response.status}: ${errorMessage}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request<{ user: any; accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string) {
    return this.request<{ user: any; accessToken: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" });
  }

  async refresh() {
    return this.request<{ user: any; accessToken: string }>("/auth/refresh", {
      method: "POST",
    });
  }

  // Communities
  async getCommunity(id: string) {
    return this.request(`/communities/${id}`);
  }

  // Posts
  async getCommunityPosts(
    communityId: string,
    params: { cursor?: string; limit?: number; type?: string; q?: string; tags?: string } = {}
  ) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, value.toString());
    });

    const query = searchParams.toString();
    return this.request(`/communities/${communityId}/posts${query ? `?${query}` : ""}`);
  }

  async createPost(postData: {
    communityId: string;
    type: string;
    title: string;
    body: string;
    tags?: string[];
    meta?: any;
  }) {
    return this.request("/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  }

  async getPost(id: string) {
    return this.request(`/posts/${id}`);
  }

  // Comments
  async getPostComments(postId: string, params: { cursor?: string; limit?: number } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, value.toString());
    });

    const query = searchParams.toString();
    return this.request(`/posts/${postId}/comments${query ? `?${query}` : ""}`);
  }

  async createComment(postId: string, body: string) {
    return this.request(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  }

  // Votes
  async voteOnPoll(postId: string, optionIndex: number) {
    return this.request(`/posts/${postId}/votes`, {
      method: "POST",
      body: JSON.stringify({ optionIndex }),
    });
  }

  async getPollTally(postId: string) {
    return this.request(`/posts/${postId}/votes/tally`);
  }

  // Reports
  async createReport(targetType: string, targetId: string, reason: string) {
    return this.request("/reports", {
      method: "POST",
      body: JSON.stringify({ targetType, targetId, reason }),
    });
  }

  // Moderation
  async getModerationReports(params: { cursor?: string; limit?: number; status?: string } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, value.toString());
    });

    const query = searchParams.toString();
    return this.request(`/moderation/reports${query ? `?${query}` : ""}`);
  }

  async hideContent(id: string, targetType: string) {
    return this.request(`/moderation/${id}/hide`, {
      method: "POST",
      body: JSON.stringify({ targetType }),
    });
  }

  async resolveReport(id: string) {
    return this.request(`/moderation/reports/${id}/resolve`, {
      method: "POST",
    });
  }

  // Uploads
  async getUploadSignedUrl(contentType: string, filename: string) {
    return this.request<{ url: string; key: string; publicUrl: string }>("/uploads/sign", {
      method: "POST",
      body: JSON.stringify({ contentType, filename }),
    });
  }

  // Notifications
  async getNotifications() {
    return this.request("/notifications");
  }

  async getUnreadCount() {
    return this.request<{ count: number }>("/notifications/unread-count");
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: "POST" });
  }
}

export const apiClient = new ApiClient();
