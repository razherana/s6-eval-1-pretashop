import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useFrontofficeAuth } from "@/hooks/useFrontofficeAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchFromPrestashopApi } from "@/utils/url";
import type { CustomerReadXML } from "@/pages/backoffice/home/types";
import { assureArray } from "@/utils/xml";

interface CustomerAuthData {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  passwd: string;
  active: number;
  is_guest: number;
}

interface CustomerListResponse {
  customers: {
    customer: CustomerAuthData[] | CustomerAuthData;
  };
}

export function LoginPage() {
  const navigate = useNavigate();
  const { authData, login, loginAsCustomer } = useFrontofficeAuth();
  const [username, setUsername] = useState("rakoto@yopmail.com");
  const [password, setPassword] = useState("XvzsX5O0!GBD0uXQ");
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerReadXML[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    if (authData.isAuthenticated) {
      navigate("/frontoffice/home", { replace: true });
    }
  }, [authData.isAuthenticated, navigate]);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const response = await fetchFromPrestashopApi<CustomerListResponse>(
          "/customers?display=full",
          { method: "GET" }
        );

        console.log("Fetched customers:", response);

        const customersData = response.customers?.customer;

        if (!customersData) {
          toast.error("No customers found");
          return;
        }

        // Ensure customers is an array
        const customerList = assureArray(customersData);

        // Filter only active customers
        const activeCustomers = customerList.filter(
          (c) => c.active === 1 && c.is_guest === 0
        );

        const formattedCustomers: CustomerReadXML[] = activeCustomers.map((c) => ({
          id: c.id,
          firstname: c.firstname,
          lastname: c.lastname,
          email: c.email,
          is_guest: c.is_guest,
        }));

        setCustomers(formattedCustomers);
      } catch (error) {
        console.error("Error loading customers:", error);
        toast.error("Failed to load customers");
      } finally {
        setLoadingCustomers(false);
      }
    };
    loadCustomers();
  }, []);

  const handleLoginAsCustomer = async (customer: CustomerReadXML) => {
    try {
      setLoading(true);
      await loginAsCustomer(customer);

      toast.success(`Logged in as ${customer.firstname} ${customer.lastname}`);
      navigate("/frontoffice/home", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to log in.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    navigate("/frontoffice/home", { replace: true });
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      await login(username, password);
      toast.success("Successfully logged in.");
      navigate("/frontoffice/home", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to log in.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 px-4 py-12 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Sign in to your account or continue as guest
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="choose-user">
              Choose User
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handleGuestLogin}
                  disabled={loading}
                  type="button"
                >
                  Continue as Guest
                </Button>
                <Button variant="link" type="button" size="sm" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="choose-user">
            <CardContent className="space-y-4">
              {loadingCustomers ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading customers...
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active customers found
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {customers.map((customer) => (
                    <Button
                      key={customer.id}
                      variant="outline"
                      className="w-full justify-start h-auto py-3 px-4"
                      onClick={() => handleLoginAsCustomer(customer)}
                      disabled={loading}
                    >
                      <div className="text-left">
                        <div className="font-medium">
                          {customer.firstname} {customer.lastname}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {customer.email}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                className="w-full"
                variant="secondary"
                onClick={handleGuestLogin}
                disabled={loading}
              >
                Continue as Guest
              </Button>
              <Button variant="link" type="button" size="sm" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}