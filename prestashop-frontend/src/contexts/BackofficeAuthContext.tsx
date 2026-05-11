import { createContext } from "react";

export interface BackofficeAuthData {
  isAuthenticated: boolean;
  user?: {
    id: number;
    name: string;
  }
}

export interface BackofficeAuthContextType {
  authData: BackofficeAuthData;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const BackofficeAuthContext = createContext<BackofficeAuthContextType | undefined>(undefined);