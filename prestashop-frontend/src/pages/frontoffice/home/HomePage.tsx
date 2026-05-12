// src/pages/frontoffice/home/HomePage.tsx - Updated header section
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartDrawerComponent } from './components/CartDrawerComponent';
import { ProductGridComponent } from './components/ProductGridComponent';
import { useLanguage } from '@/hooks/useLanguage';
import { useFrontofficeAuth } from '@/hooks/useFrontofficeAuth';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  User, 
  LogOut, 
  LogIn,
  ShoppingBag 
} from 'lucide-react';
import { LanguageLoadingComponent } from '@/components/ui-manual/language-loading-state';
import { SelectLanguageCurrency } from '@/components/ui-manual/select-lang';
import { FrontofficeDataLoadingComponent } from '@/components/ui-manual/frontofficedata-loading-state';
import { useFrontofficeData } from '@/hooks/useFrontofficeData';
import { CheckoutDialogComponent } from './components/CheckoutDialogComponent';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function HomePage() {
  const { language } = useLanguage();
  const { data } = useFrontofficeData();
  const { authData, logout } = useFrontofficeAuth();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (!language) {
    return <LanguageLoadingComponent />;
  }

  if (!data) {
    return <FrontofficeDataLoadingComponent />;
  }

  const currency = language.currency;
  const locale = language.locale;
  const conversionRate = language.conversion_change;

  const handleLogout = () => {
    logout();
    navigate('/frontoffice/home');
  };

  return (
    <div className="min-h-screen bg-background">
      <CheckoutDialogComponent />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">PrestaShop</h1>
            </div>

            <div className="hidden md:flex flex-1 mx-8">
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full rounded-full border bg-muted pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <SelectLanguageCurrency />
              <CartDrawerComponent />
              
              {/* User Menu */}
              {authData.isAuthenticated && authData.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {authData.user.firstname} {authData.user.lastname}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {authData.user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/frontoffice/orders')}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/frontoffice/login')}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary to-primary/60 p-8 md:p-12 text-white">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Discover Our Products
              </h2>
              <p className="text-lg md:text-xl mb-6 opacity-90">
                Quality products at great prices. Shop now and find the
                perfect items for you.
              </p>
              <Button size="lg" variant="secondary" className="font-semibold">
                Shop Now
              </Button>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 transform skew-x-12" />
          </div>
        </section>

        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">All Products</h2>
            <p className="text-muted-foreground">
              Browse our complete catalog
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <ProductGridComponent
          languageId={language.language_id}
          currency={currency}
          conversionRate={conversionRate}
          locale={locale}
        />
      </main>

      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">About Us</h3>
              <p className="text-sm text-muted-foreground">
                Your trusted online store for quality products.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Shipping Information</li>
                <li>Returns & Exchanges</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>New Arrivals</li>
                <li>Best Sellers</li>
                <li>Special Offers</li>
                <li>Gift Cards</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Subscribe to get special offers and updates.
              </p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                />
                <Button size="sm">Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 PrestaShop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}