'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(
  undefined,
);

const API_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    : process.env.API_URL || 'http://localhost:3000';

function getTenantSlug(): string {
  if (typeof window === 'undefined') return 'demo';
  return window.location.hostname.split('.')[0];
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    const savedCustomer = localStorage.getItem('customer_data');
    if (token && savedCustomer) {
      try {
        setCustomer(JSON.parse(savedCustomer));
      } catch {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const tenantSlug = getTenantSlug();
    const res = await fetch(
      `${API_URL}/api/public/${tenantSlug}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Ungültige Anmeldedaten');
    }

    const data = await res.json();
    localStorage.setItem('customer_token', data.accessToken);
    localStorage.setItem('customer_data', JSON.stringify(data.customer));
    setCustomer(data.customer);
  };

  const register = async (input: RegisterData) => {
    const tenantSlug = getTenantSlug();
    const res = await fetch(
      `${API_URL}/api/public/${tenantSlug}/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registrierung fehlgeschlagen');
    }

    const data = await res.json();
    localStorage.setItem('customer_token', data.accessToken);
    localStorage.setItem('customer_data', JSON.stringify(data.customer));
    setCustomer(data.customer);
  };

  const logout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoading,
        isAuthenticated: !!customer,
        login,
        register,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error(
      'useCustomerAuth must be used within CustomerAuthProvider',
    );
  }
  return context;
}