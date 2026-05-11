import { type BackofficeAuthContextType, BackofficeAuthContext } from "@/contexts/BackofficeAuthContext";
import { useContext } from "react";

export const useBackofficeAuth = (): BackofficeAuthContextType => {
  const context = useContext(BackofficeAuthContext);
  if (context === undefined) {
    throw new Error("useBackofficeAuth must be used within a BackofficeAuthProvider");
  }
  return context;
};
