import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  organization: string;
  role: string;
  isDemo: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, organization: string, email: string, password: string) => Promise<boolean>;
  loginAsDemo: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  name: 'Officer S. Ramanathan',
  email: 'ram.authority@coimbatore.gov.in',
  organization: 'Coimbatore Municipal Corporation',
  role: 'Chief Infrastructure Engineer',
  isDemo: true,
};

const STORAGE_KEY = 'civicx_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEMO_USER; // Default to demo session for instant hackathon access
    } catch {
      return DEMO_USER;
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
    // Simulate lightweight auth validation
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (email && password.length >= 6) {
      const profile: UserProfile = {
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email,
        organization: 'Municipal Works Directorate',
        role: 'Infrastructure Executive',
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
    password: string
  ): Promise<boolean> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (name && email && password.length >= 6) {
      const profile: UserProfile = {
        name,
        email,
        organization: organization || 'Civic Infrastructure Works',
        role: 'Municipal Planner',
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
    setUser(DEMO_USER);
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
