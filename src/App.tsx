import React, { useState, useEffect } from 'react';
import { SettingsProvider } from './context/SettingsContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { AdminAuthProvider } from './context/AdminAuthContext.tsx';
import { Header } from './components/Header.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { CategoriesSpotlight } from './components/CategoriesSpotlight.tsx';
import { FeaturedCreations } from './components/FeaturedCreations.tsx';
import { CollectionSection } from './components/CollectionSection.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { FactoryOutletSection } from './components/FactoryOutletSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { InstagramSection } from './components/InstagramSection.tsx';
import { Footer } from './components/Footer.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { EnquiryModal } from './components/EnquiryModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton.tsx';
import { api } from './utils/api.ts';
import type { Product, Category } from './types/index.ts';

function MainApp() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter state for Collection section
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Fetch initial catalog from API
  const loadCatalog = async () => {
    try {
      const [prods, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectCategoryFromSpotlight = (catName: string) => {
    setSelectedCategory(catName);
    setActiveSection('collection');
    const element = document.getElementById('collection');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const outletProducts = products.filter(
    (p) => p.isOutlet || p.category.toLowerCase() === 'factory outlet'
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1A17] flex flex-col font-sans selection:bg-[#8B1E2F] selection:text-white">
      {/* Top Header */}
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <div id="home">
          <HeroSection onExplore={() => handleNavigate('collection')} />
        </div>

        {/* Categories Spotlight */}
        <CategoriesSpotlight
          categories={categories}
          onSelectCategory={handleSelectCategoryFromSpotlight}
        />

        {/* Featured Creations */}
        <FeaturedCreations
          products={products}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onViewAll={() => handleNavigate('collection')}
        />

        {/* Main Collection / Catalog */}
        <div id="collection">
          <CollectionSection
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        </div>

        {/* About Bunkar Sanskriti Section */}
        <div id="about">
          <AboutSection />
        </div>

        {/* Factory Outlet Section */}
        <div id="factory-outlet">
          <FactoryOutletSection
            outletProducts={outletProducts}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        </div>

        {/* Contact & Business Hours Section */}
        <div id="contact">
          <ContactSection />
        </div>

        {/* Instagram Journal Showcase */}
        <InstagramSection />
      </main>

      {/* Luxury Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Floating WhatsApp CTA */}
      <FloatingWhatsAppButton />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenEnquiry={(p) => {
          setSelectedProduct(null);
          setEnquiryProduct(p);
        }}
      />

      <CartDrawer />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <EnquiryModal
        product={enquiryProduct}
        onClose={() => setEnquiryProduct(null)}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          loadCatalog(); // Refresh catalog if admin made modifications
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <AdminAuthProvider>
          <MainApp />
        </AdminAuthProvider>
      </CartProvider>
    </SettingsProvider>
  );
}
