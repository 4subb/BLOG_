import { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

interface MagneticParticlesProps {
  particleCount?: number;
  interactionRadius?: number;
  returnSpeed?: number;
  repelStrength?: number;
  connectionDistance?: number;
}

export function MagneticParticles({
  particleCount = 80,
  interactionRadius = 180,
  returnSpeed = 0.055,
  repelStrength = 7,
  connectionDistance = 150,
}: MagneticParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const themeRef = useRef(resolvedTheme);

  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    let raf = 0;
    // Track mouse in CANVAS-LOCAL coordinates
    let mouse = { x: -9999, y: -9999 };
    let particles: Particle[] = [];
    let clickPulses: { x: number; y: number; t: number; maxR: number }[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    const initParticles = () => {
      particles = Array.from({ length: particleCount }, () => {
        const x = Math.random() * w;
        const y = Math.random() * h;
        return {
          x, y, baseX: x, baseY: y,
          vx: 0, vy: 0,
          size: 1.5 + Math.random() * 2,
          opacity: 0.25 + Math.random() * 0.45,
          hue: 210 + Math.random() * 40,
        };
      });
    };

    const toCanvasCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    // Use WINDOW-level listener so events fire even when cursor is over text/cards
    const onMouseMove = (e: MouseEvent) => {
      const pos = toCanvasCoords(e.clientX, e.clientY);
      mouse.x = pos.x;
      mouse.y = pos.y;
    };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onMouseDown = (e: MouseEvent) => {
      const pos = toCanvasCoords(e.clientX, e.clientY);
      clickPulses.push({
        x: pos.x, y: pos.y,
        t: performance.now(),
        maxR: Math.max(w, h),
      });
    };

    // Attach to WINDOW to capture events regardless of which element is on top
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    document.body.addEventListener('mouseleave', onMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const isDark = themeRef.current === 'dark';
      const now = performance.now();

      // Click pulse rings
      clickPulses = clickPulses.filter(p => {
        const age = (now - p.t) / 1000;
        const r = age * 400;
        if (r > p.maxR) return false;
        const alpha = Math.max(0, 1 - r / p.maxR);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = isDark
          ? `rgba(100, 160, 255, ${alpha * 0.5})`
          : `rgba(30, 80, 200, ${alpha * 0.35})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        return true;
      });

      // Update particles
      particles.forEach((p) => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Repel from cursor
        if (dist < interactionRadius && dist > 1) {
          const force = (1 - dist / interactionRadius);
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force * repelStrength;
          p.vy -= Math.sin(angle) * force * repelStrength;
        }

        // Click pulses attract
        clickPulses.forEach(pulse => {
          const pdx = pulse.x - p.x;
          const pdy = pulse.y - p.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          const age = (now - pulse.t) / 1000;
          const ringR = age * 400;
          const band = 60;
          if (pdist > 1 && Math.abs(pdist - ringR) < band) {
            const strength = (1 - Math.abs(pdist - ringR) / band) * 3;
            p.vx += (pdx / pdist) * strength;
            p.vy += (pdy / pdist) * strength;
          }
        });

        // Spring back to base
        p.vx += (p.baseX - p.x) * returnSpeed;
        p.vy += (p.baseY - p.y) * returnSpeed;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const cx = a.x - b.x;
          const cy = a.y - b.y;
          const cdist = Math.sqrt(cx * cx + cy * cy);
          if (cdist < connectionDistance) {
            const nearCursor =
              Math.sqrt((a.x - mouse.x) ** 2 + (a.y - mouse.y) ** 2) < interactionRadius ||
              Math.sqrt((b.x - mouse.x) ** 2 + (b.y - mouse.y) ** 2) < interactionRadius;
            const lineAlpha = (1 - cdist / connectionDistance) * (nearCursor ? 0.9 : 0.25);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = isDark
              ? `hsla(${a.hue}, 70%, 75%, ${lineAlpha})`
              : `hsla(${a.hue}, 80%, 38%, ${lineAlpha})`;
            ctx.lineWidth = nearCursor ? 1.1 : 0.4;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        const distToCursor = Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2);
        const glowRatio = Math.max(0, 1 - distToCursor / interactionRadius);
        const size = p.size + glowRatio * 4;
        const opacity = p.opacity + glowRatio * 0.6;

        if (glowRatio > 0.05) {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 5);
          grd.addColorStop(0, isDark
            ? `hsla(${p.hue}, 90%, 80%, ${opacity * 0.7})`
            : `hsla(${p.hue}, 90%, 45%, ${opacity * 0.5})`);
          grd.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 5, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `hsla(${p.hue}, 80%, 78%, ${opacity})`
          : `hsla(${p.hue}, 90%, 35%, ${opacity})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      document.body.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [particleCount, interactionRadius, returnSpeed, repelStrength, connectionDistance]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none">
      <canvas ref={canvasRef} className="block w-full h-full" style={{ pointerEvents: 'none' }} />
    </div>
  );
}
