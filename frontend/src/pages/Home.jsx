import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";

const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-out",
      once: true,
    });
  }, []);

  return (
    <div className="overflow-visible">
      {/* Hero Section */}
      <div data-aos="zoom-in">
        <Hero />
      </div>

      {/* Other Sections */}
      <div data-aos="fade-up" data-aos-offset="150">
        <LatestCollection />
      </div>
      <div data-aos="fade-up" data-aos-offset="150">
        <BestSeller />
      </div>
      <div data-aos="fade-up" data-aos-offset="150">
        <OurPolicy />
      </div>
    </div>
  );
};

export default Home;
