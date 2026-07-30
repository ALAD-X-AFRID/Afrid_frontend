"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AfridLogo from "../layout/afrid-logo";

export default function PageCurtain() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[10000] origin-bottom pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #03040d 0%, #0d0f17 50%, #03040d 100%)",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="h-1 w-24 bg-gradient-to-r from-[#39e0ff] via-[#b27bff] to-[#ff6b6b] rounded-full mb-6 mx-auto"
              />
              <AfridLogo className="h-12" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
