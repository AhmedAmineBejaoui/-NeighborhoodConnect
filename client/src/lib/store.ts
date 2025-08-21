import React, { ReactNode, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      
      setAuth: (user, token) =>
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        }),
      
      logout: () => {
        // Best-effort server-side logout to clear refresh cookie
        try {
          void fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } catch {}
        try { localStorage.removeItem("hasLoggedInBefore"); } catch {}
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      updateUser: (user) =>
        set((state) => ({
          ...state,
          user,
        })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        // Do not persist loading flag
      }),
    }
  )
);

// Filter state
interface FilterState {
  activeFilter: string;
  searchQuery: string;
  setFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  activeFilter: "all",
  searchQuery: "",
  
  setFilter: (filter) => set({ activeFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearFilters: () => set({ activeFilter: "all", searchQuery: "" }),
}));

// Composer state
interface ComposerState {
  isOpen: boolean;
  type: "post" | "poll" | "market" | "announcement" | "service";
  title: string;
  body: string;
  tags: string[];
  price?: number;
  images: string[];
  pollOptions: string[];
  openComposer: (type?: ComposerState["type"]) => void;
  closeComposer: () => void;
  setTitle: (title: string) => void;
  setBody: (body: string) => void;
  setTags: (tags: string[]) => void;
  setPrice: (price: number | undefined) => void;
  setImages: (images: string[]) => void;
  setPollOptions: (options: string[]) => void;
  reset: () => void;
}

export const useComposerStore = create<ComposerState>((set) => ({
  isOpen: false,
  type: "post",
  title: "",
  body: "",
  tags: [],
  price: undefined,
  images: [],
  pollOptions: ["", ""],
  
  openComposer: (type = "post") => set({ isOpen: true, type }),
  closeComposer: () => set({ isOpen: false }),
  setTitle: (title) => set({ title }),
  setBody: (body) => set({ body }),
  setTags: (tags) => set({ tags }),
  setPrice: (price) => set({ price }),
  setImages: (images) => set({ images }),
  setPollOptions: (options) => set({ pollOptions: options }),
  
  reset: () => set({
    title: "",
    body: "",
    tags: [],
    price: undefined,
    images: [],
    pollOptions: ["", ""],
  }),
}));

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      try {
        useAuthStore.getState().setLoading(true);
        // Only attempt refresh for returning users to avoid 401 spam on first visits
        const shouldAttemptRefresh = (() => {
          try { return localStorage.getItem('hasLoggedInBefore') === '1'; } catch { return false; }
        })();
        if (!shouldAttemptRefresh) return;
        // Attempt refresh using httpOnly cookie without throwing on 401
        const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        if (!isMounted) return;
        if (res.ok) {
          const result = await res.json();
          useAuthStore.getState().setAuth(result.user, result.accessToken);
        } else {
          // Ensure logged out state if refresh fails
          useAuthStore.getState().logout();
        }
      } catch {
        if (!isMounted) return;
        useAuthStore.getState().logout();
      } finally {
        if (!isMounted) return;
        useAuthStore.getState().setLoading(false);
      }
    };

    void initializeAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  return children;
}
