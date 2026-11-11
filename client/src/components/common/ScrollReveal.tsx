import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'fade' | 'zoom-in';
  direction?: 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'fade' | 'zoom-in';
  delay?: number; // Delay in milliseconds
  duration?: number; // Duration in milliseconds
  className?: string;
  threshold?: number;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation,
  direction,
  delay = 0,
  duration = 600,
  className = '',
  threshold = 0.1,
  once = true,
}) => {
  const chosenAnimation = animation || direction || 'slide-up';
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;

    // Check if IntersectionObserver is available
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  // Initial hidden states depending on animation type
  const getInitialTransform = () => {
    switch (chosenAnimation) {
      case 'slide-up':
        return 'translate-y-8';
      case 'slide-down':
        return '-translate-y-8';
      case 'slide-left':
        return 'translate-x-8';
      case 'slide-right':
        return '-translate-x-8';
      case 'zoom-in':
        return 'scale-95';
      case 'fade':
      default:
        return 'translate-y-0';
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
      className={`transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? 'opacity-100 translate-y-0 translate-x-0 scale-100 pointer-events-auto'
          : `opacity-0 ${getInitialTransform()} pointer-events-none`
      } ${className}`}
    >
      {children}
    </div>
  );
};
