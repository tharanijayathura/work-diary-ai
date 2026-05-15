import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
