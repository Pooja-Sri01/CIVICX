import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService } from '../services/api';

export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  ward?: string;
  organization: string;
  role: string; // 'CITIZEN', 'CHIEF_ENGINEER', 'COMMISSIONER', 'URBAN_PLANNER', 'MUNICIPAL_INSPECTOR'
  userType: 'CITIZEN' | 'MUNICIPAL';
  officerId?: string;
  pointsBalance?: number;
  isVerified?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isCitizen: boolean;
  isMunicipal: boolean;
  loading: boolean;
  citizenSendOtp: (email: string) => Promise<{ success: boolean; message: string; dev_code?: string }>;
  citizenVerifyOtp: (email: string, otp_code: string) => Promise<{ success: boolean; message: string }>;
  citizenCompleteRegistration: (
    email: string,
    name: string,
    phone: string,
    ward: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  citizenLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  municipalLogin: (email: string, password: string, role?: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, organization: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'civicx_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
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

  const isCitizen = user?.userType === 'CITIZEN' || user?.role === 'CITIZEN';
  const isMunicipal = user?.userType === 'MUNICIPAL';

  // Step 1: Send Secure Random Email OTP
  const citizenSendOtp = async (email: string): Promise<{ success: boolean; message: string; dev_code?: string }> => {
    setLoading(true);
    const res = await ApiService.citizenSendOtp(email);
    setLoading(false);
    return res;
  };

  // Step 2: Verify Single-Use OTP
  const citizenVerifyOtp = async (
    email: string,
    otp_code: string
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    const res = await ApiService.citizenVerifyOtp({ email, otp_code });
    setLoading(false);
    return res;
  };

  // Step 3: Complete Citizen Registration with Password
  const citizenCompleteRegistration = async (
    email: string,
    name: string,
    phone: string,
    ward: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    const res = await ApiService.citizenCompleteRegistration({
      email,
      name,
      phone,
      ward,
      password
    });
    if (res.success && res.user) {
      const profile: UserProfile = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        phone: res.user.phone,
        ward: res.user.ward,
        organization: 'Resident of Coimbatore',
        role: 'CITIZEN',
        userType: 'CITIZEN',
        pointsBalance: res.user.points_balance || 100,
        isVerified: true
      };
      setUser(profile);
    }
    setLoading(false);
    return res;
  };

  // Citizen Sign In (Validated against database)
  const citizenLogin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    const res = await ApiService.citizenLogin({ email, password });
    if (res.success && res.user) {
      const profile: UserProfile = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        phone: res.user.phone,
        ward: res.user.ward,
        organization: 'Resident of Coimbatore',
        role: 'CITIZEN',
        userType: 'CITIZEN',
        pointsBalance: res.user.points_balance || 100,
        isVerified: true
      };
      setUser(profile);
    }
    setLoading(false);
    return res;
  };

  // Municipal Government Official Sign In
  const municipalLogin = async (
    email: string,
    password: string,
    selectedRole?: string
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    
    const cleanEmail = email.trim().toLowerCase();

    // Verify authorized municipal officer credentials
    const isAuthority = (cleanEmail === 'authority@coimbatore.gov.in' || cleanEmail === 'officer@coimbatore.gov.in' || cleanEmail.endsWith('@coimbatore.gov.in'));
    const isValidPass = (password === 'civicx2026' || password === 'CivicX@2026' || password === 'admin123' || (cleanEmail.endsWith('@coimbatore.gov.in') && password.length >= 6));

    if (!isAuthority || !isValidPass) {
      setLoading(false);
      return {
        success: false,
        message: 'Invalid official credentials. Please check your municipal email and access key.'
      };
    }

    let roleTitle = selectedRole || 'Chief Municipal Engineer';
    let officerId = 'TN-CBE-MUNI-01';

    if (selectedRole === 'COMMISSIONER' || cleanEmail.includes('commissioner')) {
      roleTitle = 'Municipal Commissioner';
      officerId = 'TN-CBE-IAS-01';
    } else if (selectedRole === 'URBAN_PLANNER' || cleanEmail.includes('planner')) {
      roleTitle = 'Chief Urban Planner';
      officerId = 'TN-CBE-PLAN-04';
    } else if (selectedRole === 'INSPECTOR' || cleanEmail.includes('inspector')) {
      roleTitle = 'Senior Infrastructure Inspector';
      officerId = 'TN-CBE-INSP-12';
    }

    const namePart = cleanEmail.split('@')[0].replace('.', ' ').toUpperCase();
    const profile: UserProfile = {
      name: cleanEmail.includes('authority') ? 'Er. S. Ramanathan' : `Officer ${namePart}`,
      email: cleanEmail,
      organization: 'Coimbatore Municipal Corporation (Directorate of Works)',
      role: roleTitle,
      userType: 'MUNICIPAL',
      officerId: officerId,
      isVerified: true
    };

    setUser(profile);
    setLoading(false);
    return { success: true, message: 'Municipal official authenticated successfully.' };
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
    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      organization: organization || 'Coimbatore Municipal Corporation',
      role: role || 'Assistant Executive Engineer',
      userType: 'MUNICIPAL',
      officerId: `TN-CBE-${Math.floor(1000 + Math.random() * 9000)}`,
      isVerified: true
    };
    setUser(profile);
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isCitizen,
        isMunicipal,
        loading,
        citizenSendOtp,
        citizenVerifyOtp,
        citizenCompleteRegistration,
        citizenLogin,
        municipalLogin,
        register,
        logout
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
