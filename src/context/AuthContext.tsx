import  {
  createContext,
  useContext,
  useState,
  useEffect,
 type ReactNode,
} from 'react';
import type { User, AuthResponse } from '../types/api.types';
import { loginRequest } from '../services/authService';
import { TokenManager } from '../services/tokenManager';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = TokenManager.getToken();
    const savedUser = TokenManager.getUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }

    setIsLoading(false);
  }, []);

  const applyAuthResponse = (data: AuthResponse): void => {
    if (data.user.role !== 'RESTAURANT') {
      throw new Error('Доступ только для владельцев ресторанов');
    }

    TokenManager.setToken(data.accessToken);
    TokenManager.setUser(data.user);
    setToken(data.accessToken);
    setUser(data.user);
  };

  const login = async (email: string, password: string): Promise<void> => {
    const data = await loginRequest({ email, password });
    applyAuthResponse(data);
  };

  const logout = (): void => {
    TokenManager.clearToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};