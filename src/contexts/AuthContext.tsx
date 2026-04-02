import { createContext, useContext, useState, ReactNode } from 'react';

// ── Mock credentials ──────────────────────────────────────────
const MOCK_EMAIL    = 'admin@123.com';
const MOCK_PASSWORD = '12345678';

// ── Types ─────────────────────────────────────────────────────
interface MockUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: MockUser | null;
  session: MockUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading] = useState(false);

  const signIn = async (email: string, password: string) => {
    if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
      setUser({ id: 'mock-admin-001', email });
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const signOut = async () => {
    setUser(null);
  };

  const value = {
    user,
    session: user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
