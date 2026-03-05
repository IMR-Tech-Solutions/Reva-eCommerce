import AboutHero from "../components/EcommerceAboutPage/AboutHero";
import Aboutstats from "../components/EcommerceAboutPage/Aboutstats";
import Aboutwhatmakesus from "../components/EcommerceAboutPage/Aboutwhatmakesus";
import Abouthubsection from "../components/EcommerceAboutPage/Abouthubsection";
import Aboutleadership from "../components/EcommerceAboutPage/Aboutleadership";
import Abouttopbrands from "../components/EcommerceAboutPage/Abouttopbrands";

const EcommerceAboutPage = () => {
  return (
    <div className="w-full">
      <AboutHero />
      <Aboutstats />
      <Aboutwhatmakesus />
      <Abouthubsection />
      <Aboutleadership />
      <Abouttopbrands />
    </div>
  );
};

export default EcommerceAboutPage;