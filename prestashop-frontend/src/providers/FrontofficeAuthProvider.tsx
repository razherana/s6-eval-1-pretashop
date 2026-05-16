// src/providers/FrontofficeAuthProvider.tsx
import { FrontofficeAuthContext, type FrontofficeAuthData } from "@/contexts/FrontofficeAuthContext";
import { useState, useEffect, type ReactNode } from "react";
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

const GUEST_EMAIL = import.meta.env.VITE_PRESTASHOP_API_GUEST_EMAIL;

export function FrontofficeAuthProvider({
  children,
}: FrontofficeAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<CustomerReadXML | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch guest user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a stored user
        const stored = localStorage.getItem("frontoffice_user");
        if (stored) {
          try {
            const parsedUser = JSON.parse(stored);
            if (parsedUser && parsedUser.is_guest !== 1) {
              setUser(parsedUser);
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            }
          } catch {
            localStorage.removeItem("frontoffice_user");
          }
        }

        // Fall back to guest user
        const response = await fetchFromPrestashopApi<{
          customers: { customer: CustomerReadXML };
        }>(
          `/customers?display=[id,email,firstname,lastname,passwd,active,is_guest]&filter[email]=[${GUEST_EMAIL}]`,
          { method: "GET" },
        );

        const guestCustomer = response.customers.customer;
        if (guestCustomer) {
          guestCustomer.is_guest = 1;
          setUser(guestCustomer);
          localStorage.setItem("frontoffice_user", JSON.stringify(guestCustomer));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const data: FrontofficeAuthData = {
    isAuthenticated,
    user,
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetchFromPrestashopApi<CustomerListResponse>(
        "/customers?display=[id,email,firstname,lastname,passwd,active,is_guest]",
        { method: "GET" },
      );

      const customers = response.customers?.customer;

      if (!customers) {
        throw new Error("No customers found");
      }

      const customerList = Array.isArray(customers) ? customers : [customers];

      const customer = customerList.find(
        (c) => c.email.toLowerCase() === email.toLowerCase(),
      );

      if (!customer) {
        throw new Error("Invalid email or password");
      }

      if (customer.active == "0" || customer.active == "false") {
        throw new Error("Account is deactivated. Please contact support.");
      }

      const isPasswordValid = await bcrypt.compare(password, customer.passwd);

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      const authenticatedUser: CustomerReadXML = {
        id: parseInt(customer.id),
        firstname: customer.firstname,
        lastname: customer.lastname,
        email: customer.email,
        is_guest: 0,
      };

      await loginAsCustomer(authenticatedUser);

      console.log(
        `Customer authenticated: ${customer.firstname} ${customer.lastname} (${customer.email})`,
      );
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const loginAsCustomer = async (customer: CustomerReadXML) => {
    localStorage.setItem("frontoffice_user", JSON.stringify(customer));
    setUser(customer);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    setIsAuthenticated(false);

    // Clear cart data from localStorage
    localStorage.removeItem("cartId");

    // Fetch guest user data
    try {
      const response = await fetchFromPrestashopApi<{
        customers: { customer: CustomerReadXML };
      }>(
        `/customers?display=[id,email,firstname,lastname,passwd,active,is_guest]&filter[email]=[${GUEST_EMAIL}]`,
        { method: "GET" },
      );

      const guestCustomer = response.customers.customer;
      if (guestCustomer) {
        guestCustomer.is_guest = 1;
        setUser(guestCustomer);
        localStorage.setItem("frontoffice_user", JSON.stringify(guestCustomer));
      }
    } catch (error) {
      console.error("Error fetching guest user:", error);
    }
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <FrontofficeAuthContext.Provider
      value={{ authData: data, login, logout, loginAsCustomer }}
    >
      {children}
    </FrontofficeAuthContext.Provider>
  );
}