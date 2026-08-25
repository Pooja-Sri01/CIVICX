import { UserProfile } from '../context/AuthContext';

const STORAGE_KEY = 'civicx_auth_session';

export const AuthService = {
  getCurrentUser: (): UserProfile | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },
};
