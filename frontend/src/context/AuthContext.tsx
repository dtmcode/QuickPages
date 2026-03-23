'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  package?: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  login: (accessToken: string, refreshToken: string, user: User, tenant: Tenant) => void;
  logout: () => void;
  updateTenant: (tenant: Tenant) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = Cookies.get('accessToken');
    const userData = Cookies.get('user');
    const tenantData = Cookies.get('tenant');

    console.log('🔍 Auth Check:', { 
      hasToken: !!token, 
      hasUser: !!userData, 
      hasTenant: !!tenantData 
    });

    if (token && userData && tenantData) {
      try {
        setUser(JSON.parse(userData));
        setTenant(JSON.parse(tenantData));
      } catch (error) {
        console.error('Error parsing auth data:', error);
        // Clear corrupted cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('user');
        Cookies.remove('tenant');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string, user: User, tenant: Tenant) => {
    Cookies.set('accessToken', accessToken, { expires: 1/96 }); // 15 minutes
    Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days
    Cookies.set('user', JSON.stringify(user), { expires: 7 });
    Cookies.set('tenant', JSON.stringify(tenant), { expires: 7 });
    
    setUser(user);
    setTenant(tenant);
    router.push('/dashboard');
  };

  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
    Cookies.remove('tenant');
    
    setUser(null);
    setTenant(null);
    router.push('/login');
  };

  const updateTenant = (updatedTenant: Tenant) => {
    setTenant(updatedTenant);
    Cookies.set('tenant', JSON.stringify(updatedTenant), { expires: 7 });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        login,
        logout,
        updateTenant,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}