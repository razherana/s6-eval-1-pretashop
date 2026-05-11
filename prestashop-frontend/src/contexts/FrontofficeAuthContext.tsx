import type { CustomerReadXML } from "@/pages/backoffice/home/types";
import { createContext } from "react";

export interface FrontofficeAuthData {
  isAuthenticated: boolean;
  user?: CustomerReadXML;
}

export interface FrontofficeAuthContextType {
  authData: FrontofficeAuthData;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const FrontofficeAuthContext = createContext<FrontofficeAuthContextType | undefined>(undefined);
