// src/ecommerce-pages/layout/EcommerceLayout.tsx
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import Breadcrumb from "../components/Breadcrumb.tsx";
import Loader from "../components/Loader.tsx";

const EcommerceLayout = () => {
  const location              = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show loader on every route change
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500); // ← tune this (ms)
    return () => clearTimeout(timer);
  }, [location.pathname]); // ← fires on every page change

  return (
    <>
      {loading && <Loader />}
      <Header />
      <Breadcrumb />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default EcommerceLayout;
