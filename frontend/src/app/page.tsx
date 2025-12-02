"use client";

import Benefits from "@/components/Benefits";
import CTA from "@/components/CTA";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";

const HomePage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Benefits />
      <CTA />
    </>
  );
};

export default HomePage;
