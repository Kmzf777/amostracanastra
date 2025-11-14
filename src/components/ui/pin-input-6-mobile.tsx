"use client";

import { PinInput } from "@ark-ui/react/pin-input";
import { motion } from "framer-motion";

export default function PinInput6Mobile({ onComplete }: { onComplete: (value: string) => void }) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-[200px]">
        <PinInput.Root onValueComplete={(e) => onComplete(e.valueAsString)}>
          <PinInput.Control className="flex gap-1 md:gap-2 justify-center">
            {[0, 1, 2, 3, 4, 5].map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
              >
                <PinInput.Input
                  index={index}
                  className="w-8 h-8 md:w-10 md:h-10 text-center text-sm md:text-lg font-bold border-2 border-amber-200 rounded-lg bg-white/90 text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500 transition-all duration-300"
                  placeholder="•"
                />
              </motion.div>
            ))}
          </PinInput.Control>
          <PinInput.HiddenInput />
        </PinInput.Root>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center text-amber-600/80 text-xs mt-2 font-medium"
        >
          Digite os 6 dígitos do seu código
        </motion.p>
      </div>
    </div>
  );
}