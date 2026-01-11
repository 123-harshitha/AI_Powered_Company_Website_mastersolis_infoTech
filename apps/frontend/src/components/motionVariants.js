// Mastersolis Infotech Motion Variants - Comprehensive animation system
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export const slideUp = {
  initial: { y: 50, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const slideDown = {
  initial: { y: -50, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const slideLeft = {
  initial: { x: 50, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const slideRight = {
  initial: { x: -50, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerContainerFast = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

export const itemFadeIn = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export const itemSlideUp = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const itemScaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

// Navigation animations
export const navItemVariants = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

export const mobileMenuVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

export const mobileMenuItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Hero animations
export const heroTitleVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.8, 
      ease: "easeOut",
      delay: 0.2 
    } 
  },
};

export const heroSubtitleVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.8, 
      ease: "easeOut",
      delay: 0.4 
    } 
  },
};

export const heroButtonsVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.8, 
      ease: "easeOut",
      delay: 0.6 
    } 
  },
};

export const heroCardsVariants = {
  initial: { y: 40, opacity: 0 },
  animate: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 0.8, 
      ease: "easeOut",
      delay: 0.8 
    } 
  },
};

// Stats animations
export const counterVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      duration: 0.6, 
      ease: "easeOut" 
    } 
  },
};

// Card animations
export const cardHoverVariants = {
  hover: { 
    y: -6, 
    transition: { 
      duration: 0.3, 
      ease: "easeOut" 
    } 
  },
};

export const cardAccentVariants = {
  initial: { scaleX: 0 },
  hover: { 
    scaleX: 1, 
    transition: { 
      duration: 0.3, 
      ease: "easeOut" 
    } 
  },
};

// Carousel animations
export const carouselSlideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

// Page transitions
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: "easeOut" 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    transition: { 
      duration: 0.4, 
      ease: "easeIn" 
    } 
  }
};

// Micro-interactions
export const buttonHoverVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
};

export const iconHoverVariants = {
  hover: { scale: 1.1, rotate: 5 },
  tap: { scale: 0.95 }
};

// Loading animations
export const loadingVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1, 
    transition: { 
      duration: 0.3 
    } 
  },
  exit: { 
    opacity: 0, 
    transition: { 
      duration: 0.2 
    } 
  }
};

// Gradient animations
export const gradientVariants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};