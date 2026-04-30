'use client';

import { useRef, useEffect, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
  className?: string;
  threshold?: number;
  distance?: number;
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  threshold = 0.12,
  distance = 28,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -48px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const hiddenTransform =
    direction === 'up'    ? `translateY(${distance}px)` :
    direction === 'left'  ? `translateX(-${distance}px)` :
                            `translateX(${distance}px)`;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0,0)' : hiddenTransform,
        transition: `opacity 0.65s var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1)) ${delay}ms, transform 0.65s var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1)) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
