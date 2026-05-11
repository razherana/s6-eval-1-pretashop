import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LayoutDashboard, Shield, Users } from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      description: "Access your personalized dashboard",
    },
    {
      icon: Shield,
      title: "Secure Access",
      description: "Enterprise-grade security for your data",
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Collaborate with your team efficiently",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Header Section */}
          <div className="space-y-4">
            <Badge variant="secondary" className="mb-4">
              Welcome Back
            </Badge>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Home Page
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your workspace and access powerful tools
            </p>
          </div>

          <Separator className="my-12" />

          {/* Feature Cards */}
          <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* CTA Card */}
          <Card className="border-2 border-primary/10 bg-primary/5 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg">
                Access your backoffice to manage operations and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The backoffice provides you with powerful tools to manage your application,
                monitor performance, and configure settings according to your needs.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button
                size="lg"
                onClick={() => navigate("/backoffice/home")}
                className="group"
              >
                Go to Backoffice Home
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardFooter>
          </Card>

          {/* Frontoffice card */}
          <Card className="border-2 border-primary/10 bg-primary/5 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-lg">
                Access your frontoffice to manage your account and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                See the store's frontoffice to manage your account, view products, and explore the shopping experience.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button
                size="lg"
                onClick={() => navigate("/frontoffice/home")}
                className="group"
              >
                Go to Frontoffice Home
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}