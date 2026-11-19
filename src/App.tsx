import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QuickFloatingWidget from '@/components/QuickFloatingWidget';
import { recordVisit } from '@/lib/visitorTracking';

// Halaman Utama diimpor langsung agar First Contentful Paint (FCP) instan
import Home from '@/pages/Home';

// Lazy loading halaman publik lainnya untuk memangkas ukuran bundle awal
const Profil = lazy(() => import('@/pages/Profil'));
const Kurikulum = lazy(() => import('@/pages/Kurikulum'));
const Kesiswaan = lazy(() => import('@/pages/Kesiswaan'));
const Kontak = lazy(() => import('@/pages/Kontak'));

// Lazy loading modul SPMB (hanya dimuat saat pengunjung mengakses SPMB)
const SpmbHome = lazy(() => import('@/pages/spmb/SpmbHome'));
const SpmbLogin = lazy(() => import('@/pages/spmb/SpmbLogin'));
const SpmbRegister = lazy(() => import('@/pages/spmb/SpmbRegister'));
const SpmbDashboard = lazy(() => import('@/pages/spmb/SpmbDashboard'));
const SpmbForm = lazy(() => import('@/pages/spmb/SpmbForm'));
const SpmbPayment = lazy(() => import('@/pages/spmb/SpmbPayment'));

// Lazy loading modul Admin Panel (terpisah total dari bundle umum)
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminRegistrations = lazy(() => import('@/pages/admin/AdminRegistrations'));
const AdminPayments = lazy(() => import('@/pages/admin/AdminPayments'));
const AdminVisitorAnalytics = lazy(() => import('@/pages/admin/AdminVisitorAnalytics'));
const AdminContent = lazy(() => import('@/pages/admin/AdminContent'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-slate-500">Memuat halaman...</span>
      </div>
    </div>
  );
}

function VisitorTracker() {
  const location = useLocation();

  useEffect(() => {
    recordVisit(location.pathname);
  }, [location.pathname]);

  return null;
}

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 relative">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <QuickFloatingWidget />
    </div>
  );
}

export default function App() {
  return (
    <>
      <VisitorTracker />
      <Routes>
        {/* Main website layout with Navbar & Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/kurikulum" element={<Kurikulum />} />
          <Route path="/kesiswaan" element={<Kesiswaan />} />
          <Route path="/kontak" element={<Kontak />} />
          
          {/* SPMB routes */}
          <Route path="/spmb" element={<SpmbHome />} />
          <Route path="/spmb/login" element={<SpmbLogin />} />
          <Route path="/spmb/register" element={<SpmbRegister />} />
          <Route path="/spmb/dashboard" element={<SpmbDashboard />} />
          <Route path="/spmb/dashboard/form" element={<SpmbForm />} />
          <Route path="/spmb/dashboard/payment" element={<SpmbPayment />} />
          <Route path="/spmb/payment" element={<SpmbPayment />} />
        </Route>

        {/* Admin routes with custom sidebar layout */}
        <Route 
          path="/admin" 
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="registrations" element={<AdminRegistrations />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="visitors" element={<AdminVisitorAnalytics />} />
          <Route path="content" element={<AdminContent />} />
        </Route>
      </Routes>
    </>
  );
}
