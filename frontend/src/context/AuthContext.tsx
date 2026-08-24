import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  organization: string;
  role: string;
  officerId?: string;
  isDemo: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, organization: string, email: string, password: string, role?: string) => Promise<boolean>;
  loginAsDemo: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_GOV_OFFICER: UserProfile = {
  name: 'Er. S. Ramanathan',
  email: 'authority@coimbatore.gov.in',
  organization: 'Coimbatore Municipal Corporation (Directorate of Works)',
  role: 'Chief Municipal Engineer',
  officerId: 'TN-CBE-MUNI-01',
  isDemo: true,
};

const STORAGE_KEY = 'civicx_auth_session';
const USERS_KEY = 'civicx_registered_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_GOV_OFFICER;
    } catch {
      return DEFAULT_GOV_OFFICER;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check default official government officer credentials
    if (
      (cleanEmail === 'authority@coimbatore.gov.in' || cleanEmail === 'officer@coimbatore.gov.in') &&
      (password === 'civicx2026' || password === 'CivicX@2026' || password.length >= 6)
    ) {
      setUser(DEFAULT_GOV_OFFICER);
      setLoading(false);
      return true;
    }

    // 2. Check registered accounts
    try {
      const usersStr = localStorage.getItem(USERS_KEY);
      if (usersStr) {
        const users: any[] = JSON.parse(usersStr);
        const match = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
        if (match) {
          setUser({
            name: match.name,
            email: match.email,
            organization: match.organization || 'Coimbatore City Corporation',
            role: match.role || 'Municipal Official',
            officerId: `TN-CBE-${Math.floor(1000 + Math.random() * 9000)}`,
            isDemo: false
          });
          setLoading(false);
          return true;
        }
      }
    } catch (e) {
      console.error('User lookup error', e);
    }

    // 3. Fallback for valid email & password
    if (cleanEmail && password.length >= 6) {
      const namePart = cleanEmail.split('@')[0].replace('.', ' ').toUpperCase();
      const profile: UserProfile = {
        name: `Officer ${namePart}`,
        email: cleanEmail,
        organization: 'Coimbatore Municipal Corporation',
        role: 'Authorized Municipal Inspector',
        officerId: `TN-CBE-${Math.floor(1000 + Math.random() * 9000)}`,
        isDemo: false,
      };
      setUser(profile);
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  };

  const register = async (
    name: string,
    organization: string,
    email: string,
    password: string,
    role?: string
  ): Promise<boolean> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    
    if (name && email && password.length >= 6) {
      const cleanEmail = email.trim().toLowerCase();
      const newUser = {
        name,
        organization: organization || 'Coimbatore Municipal Corporation',
        email: cleanEmail,
        password,
        role: role || 'Assistant Executive Engineer',
      };

      try {
        const usersStr = localStorage.getItem(USERS_KEY);
        const users = usersStr ? JSON.parse(usersStr) : [];
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      } catch (e) {
        console.error('Save user error', e);
      }

      const profile: UserProfile = {
        name,
        email: cleanEmail,
        organization: newUser.organization,
        role: newUser.role,
        officerId: `TN-CBE-${Math.floor(1000 + Math.random() * 9000)}`,
        isDemo: false,
      };
      setUser(profile);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const loginAsDemo = () => {
    setUser(DEFAULT_GOV_OFFICER);
  };


  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
