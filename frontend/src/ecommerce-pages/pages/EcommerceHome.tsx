import BestDeals from "../components/HomePage/BestDeals";
import BlogSection from "../components/HomePage/BlogSection";
import FeaturedProducts from "../components/HomePage/FeaturedProducts";
import FeaturedSection from "../components/HomePage/FeaturedSection";
import HeroSection from "../components/HomePage/HeroSection";
import LatestProducts from "../components/HomePage/LatestProducts";
import PromoAndBestSellers from "../components/HomePage/PromoAndBestSellers";
import Testimonials from "../components/HomePage/Testimonials";
import Newsletter from "../components/Newsletter";

const EcommerceHome = () => {
  return <>
  
  <HeroSection/>
  <FeaturedSection/>
  <LatestProducts/>
  <BestDeals/>
  <PromoAndBestSellers/>
  <FeaturedProducts/>
  <Testimonials/>
  <Newsletter/>
  <BlogSection/>
  </>;
};

export default EcommerceHome;
