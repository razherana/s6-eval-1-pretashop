import { type FrontofficeAuthContextType, FrontofficeAuthContext } from "@/contexts/FrontofficeAuthContext";
import { useContext } from "react";

export const useFrontofficeAuth = (): FrontofficeAuthContextType => {
  const context = useContext(FrontofficeAuthContext);
  if (context === undefined) {
    throw new Error("useFrontofficeAuth must be used within a FrontofficeAuthProvider");
  }
  return context;
};
