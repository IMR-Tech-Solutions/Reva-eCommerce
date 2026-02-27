import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import { Outlet } from "react-router";
import Breadcrumb from "../components/Breadcrumb.tsx";

const EcommerceLayout = () => {
  return (
    <>
      <Header />
      <Breadcrumb /> {/* ← zero props, fully automatic */}
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default EcommerceLayout;
