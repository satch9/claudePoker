import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { motion } from "framer-motion";

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-poker-green to-poker-felt">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <Outlet />
      </motion.main>
    </div>
  );
};
