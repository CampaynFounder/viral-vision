"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { hapticMedium } from "@/lib/utils/haptics";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    hapticMedium();
    router.push("/checkout?product=viral-starter");
  };

  return (
    <main className="min-h-screen bg-alabaster relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
          {/* Background - placeholder for video/image */}
          <div className="absolute inset-0 bg-gradient-to-b from-champagne/5 to-alabaster z-0" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="heading-luxury text-5xl md:text-6xl text-mocha mb-6"
          >
            Stop Guessing.
            <br />
            Start Posting.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-mocha-light mb-12 max-w-2xl mx-auto"
          >
            Generate viral faceless content prompts with luxury aesthetics.
            <br />
            What vibe are we monetizing today?
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-20"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticMedium();
                router.push("/auth");
              }}
              className="px-12 py-4 bg-white border-2 border-champagne text-champagne-dark rounded-2xl font-semibold text-lg touch-target hover:bg-champagne/10 hover:border-champagne-dark transition-colors shadow-md"
            >
              Try It Free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="px-12 py-4 bg-champagne text-white rounded-2xl font-semibold text-lg touch-target hover:bg-champagne-dark transition-colors shadow-lg shadow-champagne/40 relative z-20"
              style={{ 
                backgroundColor: '#D4AF37',
                color: '#FFFFFF !important'
              }}
            >
              <span style={{ color: '#FFFFFF' }}>Get the 50-Prompt Vault ($27)</span>
            </motion.button>
          </motion.div>

          {/* Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
          >
            <div>
              <h3 className="heading-luxury text-xl text-mocha mb-2">
                Speed to Viral
              </h3>
              <p className="text-mocha-light">
                Stop spending hours crafting prompts. Get viral-ready content
                ideas in seconds.
              </p>
            </div>
            <div>
              <h3 className="heading-luxury text-xl text-mocha mb-2">
                Commercial Rights
              </h3>
              <p className="text-mocha-light">
                Own your prompts. Resell them as PDF packs. Build your empire.
              </p>
            </div>
            <div>
              <h3 className="heading-luxury text-xl text-mocha mb-2">
                Luxury Aesthetics
              </h3>
              <p className="text-mocha-light">
                Old Money, Clean Girl, Dark Feminine. The vibes that convert.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
