import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------
// 1. PAGE TRANSITION WRAPPER
// ----------------------------------------------------------------------
export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 8,
      scale: shouldReduceMotion ? 1 : 0.995,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: 'easeOut' as const,
      },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -6,
      transition: {
        duration: 0.18,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('w-full', className)}
    >
      {children}
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// 2. STAGGER CONTAINERS & ITEMS
// ----------------------------------------------------------------------
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}> = ({ children, className, delay = 0, staggerDelay = 0.05 }) => {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const shouldReduceMotion = useReducedMotion();

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 12,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.28,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// 3. ANIMATED NUMERIC COUNTER
// ----------------------------------------------------------------------
export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}> = ({
  value,
  duration = 1.2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value, duration, shouldReduceMotion]);

  const formatted = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.round(displayValue).toLocaleString();

  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {prefix}{formatted}{suffix}
    </span>
  );
};

// ----------------------------------------------------------------------
// 4. INTERACTIVE HOVER / ANTI-GRAVITY CARD
// ----------------------------------------------------------------------
export const HoverCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
  depth?: boolean;
}> = ({ children, className, onClick, glow = false, depth = true }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              y: depth ? -3 : 0,
              transition: { duration: 0.18, ease: 'easeOut' },
            }
      }
      whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'transition-shadow duration-200',
        glow && 'hover:shadow-lime-glow hover:border-lime/40',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// 5. LIVE AMBIENT INTELLIGENCE BACKGROUND
// ----------------------------------------------------------------------
export const LiveAmbientBackground: React.FC<{
  dark?: boolean;
  opacity?: number;
  className?: string;
}> = ({ dark = false, opacity = 0.4, className }) => {
  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden select-none -z-10',
        className
      )}
    >
      {/* Precision Grid Layer */}
      <div
        className={cn(
          'absolute inset-0',
          dark ? 'motion-grid-pattern-dark' : 'motion-grid-pattern'
        )}
        style={{ opacity }}
      />

      {/* Subtle Ambient Radial Glow */}
      <div
        className={cn(
          'absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] rounded-full blur-[120px] pointer-events-none',
          dark ? 'bg-lime/5' : 'bg-lime/10'
        )}
      />
      <div
        className={cn(
          'absolute bottom-0 right-0 w-[500px] h-[300px] rounded-full blur-[140px] pointer-events-none',
          dark ? 'bg-cyan/5' : 'bg-blue-500/5'
        )}
      />
    </div>
  );
};

// ----------------------------------------------------------------------
// 6. LIVE STATUS PULSE INDICATOR
// ----------------------------------------------------------------------
export const StatusIndicator: React.FC<{
  status?: 'active' | 'warning' | 'critical' | 'neutral';
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}> = ({
  status = 'active',
  label,
  size = 'md',
  pulse = true,
  className,
}) => {
  const colorMap = {
    active: 'bg-lime text-lime-dark border-lime/30 ring-lime/20',
    warning: 'bg-amber-400 text-amber-900 border-amber-300 ring-amber-200',
    critical: 'bg-rose-500 text-rose-900 border-rose-300 ring-rose-200',
    neutral: 'bg-slate-400 text-slate-700 border-slate-300 ring-slate-200',
  };

  const dotColor = {
    active: 'bg-lime-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
    neutral: 'bg-slate-400',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm shadow-2xs',
        colorMap[status],
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              dotColor[status]
            )}
          />
        )}
        <span
          className={cn('relative inline-flex rounded-full h-2 w-2', dotColor[status])}
        />
      </span>
      {label && <span>{label}</span>}
    </div>
  );
};

// ----------------------------------------------------------------------
// 7. PREMIER SHIMMER SKELETON LOADERS
// ----------------------------------------------------------------------
export const ShimmerSkeleton: React.FC<{
  className?: string;
  rounded?: string;
}> = ({ className, rounded = 'rounded-xl' }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-slate-200/70 dark:bg-zinc-800/60 animate-pulse',
        rounded,
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  );
};
