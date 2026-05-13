import { FrontofficeAuthContext, type FrontofficeAuthData } from "@/contexts/FrontofficeAuthContext";
import { useState, type ReactNode } from "react";
import { fetchFromPrestashopApi } from "@/utils/url";
import type { CustomerReadXML } from "@/pages/backoffice/home/types";
import bcrypt from "bcryptjs";

interface FrontofficeAuthProviderProps {
  children: ReactNode;
}

interface CustomerAuthData {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  passwd: string;
  active: string;
}

interface CustomerListResponse {
  customers: {
    customer: CustomerAuthData[];
  };
}

export function FrontofficeAuthProvider({
  children,
}: FrontofficeAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<CustomerReadXML | null>(() => {
    try {
      const stored = localStorage.getItem("frontoffice_user");
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setIsAuthenticated(true);
        return parsedUser;
      }
    } catch (error) {
      console.error("Error reading stored user:", error);
      localStorage.removeItem("frontoffice_user");
    }
    return null;
  });

  const data: FrontofficeAuthData = {
    isAuthenticated,
    user,
  };

  const login = async (email: string, password: string) => {
    try {
      // Fetch all customers from PrestaShop API
      const response = await fetchFromPrestashopApi<CustomerListResponse>(
        "/customers?display=[id,email,firstname,lastname,passwd,active]",
        { method: "GET" }
      );

      const customers = response.customers?.customer;

      if (!customers) {
        throw new Error("No customers found");
      }

      // Ensure customers is an array
      const customerList = Array.isArray(customers) ? customers : [customers];

      // Find the customer by email
      const customer = customerList.find(
        (c) => c.email.toLowerCase() === email.toLowerCase()
      );

      if (!customer) {
        throw new Error("Invalid email or password");
      }

      // Check if the customer account is active
      if (customer.active == "0" || customer.active == "false") {
        throw new Error("Account is deactivated. Please contact support.");
      }

      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, customer.passwd);

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      // Create user object (excluding sensitive data)
      const authenticatedUser: CustomerReadXML = {
        id: parseInt(customer.id),
        firstname: customer.firstname,
        lastname: customer.lastname,
        email: customer.email,
      };

      // Store authentication state
      localStorage.setItem("frontoffice_user", JSON.stringify(authenticatedUser));

      setUser(authenticatedUser);
      setIsAuthenticated(true);

      console.log(`Customer authenticated: ${customer.firstname} ${customer.lastname} (${customer.email})`);
    } catch (error) {
      console.error("Login error:", error);

      throw error;
    }
  };

  const loginAsCustomer = async (customer: CustomerReadXML) => {
    localStorage.setItem("frontoffice_user", JSON.stringify(customer));
    setUser(customer);
    setIsAuthenticated(true);
  }

  const logout = () => {
    localStorage.removeItem("frontoffice_user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <FrontofficeAuthContext.Provider value={{ authData: data, login, logout, loginAsCustomer }}>
      {children}
    </FrontofficeAuthContext.Provider>
  );
}