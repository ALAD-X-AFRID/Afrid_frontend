"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="hero-visual reveal flex items-center justify-center"
    >
      <div className="hero-visual-frame">
        <div className="glow-ring" />
        <div className="globe-container">
          <div className="globe-bg" />
          <div className="africa-image-wrap">
            <Image
              src="/africa.svg"
              alt="Map of Africa"
              width={600}
              height={480}
              className="africa-photo"
              priority
            />
            <svg viewBox="0 0 960 480" className="hero-flow-overlay" aria-hidden="true">
              <defs>
                <linearGradient id="dataFlowGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#39e0ff" />
                  <stop offset="100%" stopColor="#b27bff" />
                </linearGradient>
              </defs>
              <path d="M 460 230 Q 430 190 400 150" stroke="url(#dataFlowGrad)" strokeWidth="3" fill="none" className="flow" opacity="0.9" />
              <path d="M 470 230 Q 520 180 600 160" stroke="url(#dataFlowGrad)" strokeWidth="3" fill="none" className="flow" opacity="0.9" />
              <path d="M 450 240 Q 320 240 180 210" stroke="url(#dataFlowGrad)" strokeWidth="3" fill="none" className="flow" opacity="0.9" />
              <path d="M 490 250 Q 650 260 780 240" stroke="url(#dataFlowGrad)" strokeWidth="3" fill="none" className="flow" opacity="0.9" />
              <circle cx="475" cy="225" r="10" fill="url(#dataFlowGrad)" className="pulse" opacity="0.95" />
              <circle cx="400" cy="150" r="5" fill="#39e0ff" opacity="0.6" />
              <circle cx="600" cy="160" r="5" fill="#b27bff" opacity="0.6" />
              <circle cx="180" cy="210" r="5" fill="#39e0ff" opacity="0.6" />
              <circle cx="780" cy="240" r="5" fill="#b27bff" opacity="0.6" />
              <text x="480" y="450" textAnchor="middle" fill="#39e0ff" fontSize="16" fontWeight="500" opacity="0.85">
                Africa feeding the world’s data economy
              </text>
            </svg>
          </div>
        </div>
        <div className="star-trails">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </motion.div>
  );
}
