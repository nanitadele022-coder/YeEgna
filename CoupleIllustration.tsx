import { motion } from "motion/react";

interface CoupleIllustrationProps {
  wifeName: string;
  husbandName: string;
}

export default function CoupleIllustration({ wifeName, husbandName }: CoupleIllustrationProps) {
  // Variants for stars/floating elements
  const floatVariant = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const coupleVariant = {
    animate: {
      y: [0, -6, 0],
      x: [0, 4, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const heartVariant = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-48 sm:h-56 bg-gradient-to-br from-pink-50/70 to-blue-50/70 rounded-3xl p-4 flex items-center justify-between overflow-hidden shadow-inner border border-white/60">
      {/* Dynamic Background clouds & Sparkles */}
      <motion.div
        className="absolute top-4 left-6 text-2xl filter blur-[0.5px] opacity-40 pointer-events-none"
        variants={floatVariant}
        animate="animate"
      >
        ☁️
      </motion.div>
      <motion.div
        className="absolute bottom-8 right-6 text-xl filter blur-[0.5px] opacity-30 pointer-events-none"
        variants={floatVariant}
        animate="animate"
        custom={1}
      >
        ☁️
      </motion.div>

      {/* Sparks of Dreams */}
      <motion.div
        className="absolute text-yellow-300 top-8 right-16 text-sm"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
      >
        ✦
      </motion.div>
      <motion.div
        className="absolute text-pink-400 bottom-12 left-10 text-xs"
        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.9, 0.3] }}
        transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
      >
        ✦
      </motion.div>

      {/* SVG Container representing stairs of prosperity & climbing couple */}
      <svg
        className="w-full h-full drop-shadow-sm pointer-events-none"
        viewBox="0 0 320 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Step 1: Budget Block */}
        <g id="step-budget">
          <path d="M 20 180 L 90 180 L 90 155 L 20 155 Z" fill="url(#budgetGrad)" />
          <text x="32" y="172" className="fill-pink-500 font-sans text-[9px] font-semibold tracking-wider">BUDGET</text>
        </g>

        {/* Step 2: Savings Block */}
        <g id="step-savings">
          <path d="M 85 180 L 155 180 L 155 125 L 85 125 Z" fill="url(#savingsGrad)" />
          <text x="96" y="142" className="fill-blue-500 font-sans text-[9px] font-semibold tracking-wider">SAVINGS</text>
        </g>

        {/* Step 3: Investment/Dream Nest Block */}
        <g id="step-nest">
          <path d="M 150 180 L 220 180 L 220 95 L 150 95 Z" fill="url(#nestGrad)" />
          <text x="162" y="112" className="fill-purple-500 font-sans text-[9px] font-semibold tracking-wider">OUR HOME</text>
        </g>

        {/* Final Goal: Dream Flag/Chest on Golden Top step */}
        <g id="goal-crown">
          <circle cx="215" cy="55" r="18" fill="white" fillOpacity="0.8" />
          <text x="207" y="61" className="text-base select-none">🏡</text>
          <path d="M 215 73 L 215 95" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="2 2" />
        </g>

        {/* Step borders for luxurious touch */}
        <path d="M 20 155 L 90 155 L 90 125 L 150 125 L 150 95 L 220 95" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

        {/* Couple climbing the stairs: animated together */}
        <motion.g id="couple-group" variants={coupleVariant} animate="animate">
          {/* Heart Float above holding hands */}
          <motion.text
            x="96"
            y="72"
            className="text-lg"
            variants={heartVariant}
            animate="animate"
          >
            💖
          </motion.text>

          {/* Lines representing holding hands */}
          <path d="M 94 100 L 106 100" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />

          {/* Husband Component (Left Side, soft blue colors) */}
          <g id="husband-climb">
            {/* Body */}
            <path
              d="M 76 112 C 76 96, 92 96, 92 112 Z"
              fill="url(#husbandBodyGrad)"
              stroke="white"
              strokeWidth="1"
            />
            {/* Head */}
            <circle cx="84" cy="91" r="9" fill="#FFE4E6" stroke="#DBEAFE" strokeWidth="1" />
            {/* Cute Hair/Cap */}
            <path d="M 75 90 C 75 82, 93 82, 93 90" fill="#3B82F6" opacity="0.8" />
            {/* Hair lock & Eyes */}
            <circle cx="82" cy="91" r="0.8" fill="#1E3A8A" />
            <circle cx="87" cy="91" r="0.8" fill="#1E3A8A" />
            <path d="M 83 94 Q 84.5 96 86 94" stroke="#1E3A8A" strokeWidth="0.8" fill="none" />
            {/* Wallet Bag */}
            <rect x="74" y="105" width="8" height="6" rx="1.5" fill="#BFDBFE" />
            <circle cx="78" cy="108" r="1.5" fill="white" />
          </g>

          {/* Wife Component (Right Side, soft pink/rose colors) */}
          <g id="wife-climb" transform="translate(18, 5)">
            {/* Body */}
            <path
              d="M 76 112 C 76 94, 92 94, 92 112 Z"
              fill="url(#wifeBodyGrad)"
              stroke="white"
              strokeWidth="1"
            />
            {/* Head */}
            <circle cx="84" cy="89" r="9" fill="#FFF1F2" stroke="#FCE7F3" strokeWidth="1" />
            {/* Sweet Hair / Pink Crown */}
            <path d="M 74 88 C 74 79, 94 79, 94 88" fill="#EC4899" opacity="0.6" />
            <circle cx="84" cy="79" r="1.5" fill="#F43F5E" />
            {/* Eyes */}
            <circle cx="81" cy="89" r="0.8" fill="#4D0620" />
            <circle cx="86" cy="89" r="0.8" fill="#4D0620" />
            {/* Cute Blush */}
            <circle cx="79" cy="91" r="1.2" fill="#F472B6" opacity="0.5" />
            <circle cx="88" cy="91" r="1.2" fill="#F472B6" opacity="0.5" />
            <path d="M 82 92 Q 83.5 94 85 92" stroke="#4D0620" strokeWidth="0.8" fill="none" />
            {/* Flower basket */}
            <path d="M 88 102 C 88 107, 94 107, 94 102 Z" fill="#FBCFE8" />
            <path d="M 88 102 Q 91 98 94 102" stroke="#EC4899" strokeWidth="1" fill="none" />
          </g>
        </motion.g>

        {/* DEFINITIONS OF LUXURY CUTE GRADIENTS */}
        <defs>
          <linearGradient id="budgetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEE2E2" />
            <stop offset="100%" stopColor="#FBCFE8" />
          </linearGradient>
          <linearGradient id="savingsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
          <linearGradient id="nestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D3F9" stopOpacity="0" />
            <stop offset="0%" stopColor="#F3E8FF" />
            <stop offset="100%" stopColor="#E9D5FF" />
          </linearGradient>
          <linearGradient id="husbandBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="wifeBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#DB2777" />
          </linearGradient>
        </defs>
      </svg>

      {/* Side Profile Tags inside of the image frame */}
      <div className="absolute top-2 left-2 bg-pink-100/90 text-pink-700 text-[10px] px-2 py-0.5 rounded-full border border-pink-200 font-semibold tracking-wider font-sans select-none">
        {wifeName} 🌸
      </div>
      <div className="absolute top-2 right-2 bg-blue-100/90 text-blue-700 text-[10px] px-2 py-0.5 rounded-full border border-blue-200 font-semibold tracking-wider font-sans select-none">
        {husbandName} 🧸
      </div>

      <div className="absolute bottom-1 w-full text-center text-[10px] font-sans text-gray-400 font-medium">
        ⭐ Step by step, we build our future legacy... ⭐
      </div>
    </div>
  );
}
