import React, { ReactNode } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      
      setAuth: (user, token) =>
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        }),
      
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
      
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
  return children;
}
