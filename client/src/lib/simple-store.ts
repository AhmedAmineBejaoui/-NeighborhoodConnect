import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token?: string | null) => void;
  logout: () => void;
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
          accessToken: token || null,
          isAuthenticated: true,
        }),
      
      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export const useComposerStore = create(() => ({
  isOpen: false,
  type: null,
  pollOptions: [],
  openComposer: (type: string) => console.log('Opening composer:', type),
  closeComposer: () => console.log('Closing composer'),
  reset: () => console.log('Resetting composer'),
  setPollOptions: (options: string[]) => console.log('Setting poll options:', options),
}));

export const usePostsStore = create(() => ({
  posts: [],
  filter: 'all',
  searchQuery: '',
  setPosts: (posts: any[]) => console.log('Setting posts:', posts.length),
  setFilter: (filter: string) => console.log('Setting filter:', filter),
  setSearchQuery: (query: string) => console.log('Setting search query:', query),
}));