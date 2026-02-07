'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplitFlapDisplayProps {
  finalText?: string;
  interval?: number;
  className?: string;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function SplitFlapDisplay({
  finalText = '1NT3NT0',
  interval = 5000,
  className = '',
}: SplitFlapDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [displayChars, setDisplayChars] = useState<string[]>(finalText.split(''));
  const [isAnimating, setIsAnimating] = useState(false);

  // Fix hydration: solo animar después del mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const getRandomChar = useCallback(() => {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const runAnimation = () => {
      setIsAnimating(true);
      const targetChars = finalText.split('');
      let settledCount = 0;

      // Iniciar con caracteres random
      setDisplayChars(targetChars.map(() => getRandomChar()));

      const flipInterval = setInterval(() => {
        setDisplayChars(prev => {
          const newChars = [...prev];
          let allSettled = true;

          for (let i = 0; i < targetChars.length; i++) {
            if (i < settledCount) {
              newChars[i] = targetChars[i];
            } else if (i === settledCount) {
              // 20% chance de "aterrizar" en la letra correcta
              if (Math.random() < 0.2) {
                newChars[i] = targetChars[i];
                settledCount++;
              } else {
                newChars[i] = getRandomChar();
                allSettled = false;
              }
            } else {
              newChars[i] = getRandomChar();
              allSettled = false;
            }
          }

          if (allSettled || settledCount >= targetChars.length) {
            clearInterval(flipInterval);
            setIsAnimating(false);
            // Reiniciar después del intervalo
            setTimeout(runAnimation, interval);
          }

          return newChars;
        });
      }, 60);

      return () => clearInterval(flipInterval);
    };

    const initialDelay = setTimeout(runAnimation, 500);
    return () => clearTimeout(initialDelay);
  }, [mounted, finalText, interval, getRandomChar]);

  // Mostrar texto estático durante SSR
  if (!mounted) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        {finalText.split('').map((char, i) => (
          <div key={i} className="flap-card">
            <span className="flap-char">{char}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <style jsx>{`
        .flap-card {
          width: 56px;
          height: 68px;
          background: linear-gradient(
            180deg,
            #1a1a1f 0%,
            #0f0f12 49.9%,
            #0a0a0c 50%,
            #0f0f12 100%
          );
          border: 1px solid rgba(196, 93, 62, 0.4);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 0 20px rgba(196, 93, 62, 0.1);
        }
        
        .flap-card::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: #0a0a0c;
          transform: translateY(-50%);
          z-index: 10;
        }
        
        .flap-card::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 4px;
          right: 4px;
          height: 1px;
          background: rgba(196, 93, 62, 0.2);
          transform: translateY(-50%);
          z-index: 11;
        }
        
        .flap-char {
          font-family: 'Space Grotesk', 'SF Mono', monospace;
          font-size: 32px;
          font-weight: 700;
          color: #C45D3E;
          text-shadow: 0 0 10px rgba(196, 93, 62, 0.5);
        }
        
        .flap-card.settled {
          border-color: rgba(196, 93, 62, 0.6);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 0 30px rgba(196, 93, 62, 0.3);
        }
        
        .flap-card.settled .flap-char {
          text-shadow: 0 0 15px rgba(196, 93, 62, 0.8);
        }
      `}</style>
      
      {displayChars.map((char, index) => {
        const isSettled = !isAnimating || char === finalText[index];
        
        return (
          <motion.div
            key={index}
            className={`flap-card ${isSettled && !isAnimating ? 'settled' : ''}`}
            initial={false}
            animate={{
              scale: isSettled && !isAnimating ? 1 : [1, 1.02, 1],
            }}
            transition={{ duration: 0.1 }}
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={`${char}-${index}`}
                className="flap-char"
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: 90, opacity: 0 }}
                transition={{ duration: 0.04, ease: 'easeOut' }}
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}