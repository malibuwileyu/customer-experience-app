import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { AuthState, Profile } from '../types/auth.types';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  setUser: (user: User | null) => set({ user }),
  setProfile: (profile: Profile | null) => set({ profile }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: Error | null) => set({ error }),
  reset: () => set(initialState),
}));
