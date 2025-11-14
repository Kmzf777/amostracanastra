"use client";

import { PinInput } from "@ark-ui/react/pin-input";
import { motion } from "framer-motion";

export default function PinInput9({ onComplete }: { onComplete: (value: string) => void }) {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <PinInput.Root onValueComplete={(e) => onComplete(e.valueAsString)}>
          <PinInput.Control className="flex gap-3 justify-center">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
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
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-amber-200 rounded-xl bg-white/90 text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/50 focus:border-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-amber-300 focus:shadow-2xl"
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
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center text-amber-600/80 text-sm mt-4 font-medium"
        >
          Digite os 9 dígitos do seu código
        </motion.p>
      </div>
    </div>
  );
}