'use client';

import { useEffect, useRef } from 'react';

interface MatrixRainProps {
  text?: string;  // "1NT3NT0" por defecto
  color?: string; // Color del texto (#C45D3E naranja por defecto)
  speed?: number; // Velocidad de caída
}

export function MatrixRain({ 
  text = "1NT3NT0", 
  color = "#C45D3E",
  speed = 50 
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = 150;
      canvas.height = window.innerHeight;
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const characters = text.split('');
    const fontSize = 20;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Array para trackear la posición Y de cada columna
    const drops: number[] = Array(columns).fill(1);

    function draw() {
      // Fondo semi-transparente para efecto de trail
      ctx!.fillStyle = 'rgba(10, 10, 12, 0.05)';
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      ctx!.fillStyle = color;
      ctx!.font = `${fontSize}px "Space Grotesk", monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Seleccionar caracter aleatorio del texto
        const char = characters[Math.floor(Math.random() * characters.length)];
        
        // Dibujar el caracter
        ctx!.fillText(char, i * fontSize, drops[i] * fontSize);

        // Resetear al llegar al fondo (con algo de aleatoriedad)
        if (drops[i] * fontSize > canvas!.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, speed);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateSize);
    };
  }, [text, color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed left-0 top-0 h-full pointer-events-none opacity-100 z-50"
      style={{ width: '150px' }}
    />
  );
}