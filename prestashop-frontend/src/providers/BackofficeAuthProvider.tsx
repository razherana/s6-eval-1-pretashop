import { BackofficeAuthContext, type BackofficeAuthData } from "@/contexts/BackofficeAuthContext";
import { useState, type ReactNode } from "react";
import { users } from "@/assets/users.json"

interface BackofficeAuthProviderProps {
  children: ReactNode;
}

export function BackofficeAuthProvider({
  children,
}: BackofficeAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: number; name: string } | undefined>(() => {
    if (localStorage.getItem("user")) {
      setIsAuthenticated(true);
      return JSON.parse(localStorage.getItem("user")!);
    }
    return undefined;
  });

  const data: BackofficeAuthData = {
    isAuthenticated,
    user,
  };

  const login = async (username: string, password: string) => {
    const foundUser = users.find(
      (u) => u.name === username && u.password === password,
    );

    if (!foundUser) {
      throw new Error("Invalid username or password");
    }

    localStorage.setItem("user", JSON.stringify(foundUser));
    setUser(foundUser);
    setIsAuthenticated(true);
  };

  const logout = () => {

    localStorage.removeItem("user");
    setUser(undefined);
    setIsAuthenticated(false);
  };

  return (
    <BackofficeAuthContext.Provider value={{ authData: data, login, logout }}>
      {children}
    </BackofficeAuthContext.Provider>
  );
}