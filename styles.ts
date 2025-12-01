
export const COLORS = {
  coral: 'text-coral',
  coralHover: 'hover:text-coral',
  coralBorder: 'border-coral',
  gray900: 'text-gray-900',
  gray600: 'text-gray-600',
  gray500: 'text-gray-500',
  gray400: 'text-gray-400',
  gray300: 'text-gray-300',
};

export const FONTS = {
  serif: 'font-serif',
  sans: 'font-sans',
  mono: 'font-mono',
};

export const TYPOGRAPHY = {
  // Large Titles (Main Name)
  h1: 'font-serif text-6xl md:text-8xl text-coral tracking-tight leading-none',

  // Splash specific title
  splashTitle: 'font-bold text-coral tracking-widest whitespace-nowrap text-[5vw] md:text-[5vw] lg:text-[5vw] xl:text-7xl leading-tight select-none px-6 md:px-12',

  // Page Headers (About, Project Flow, Photography)
  h2: 'font-serif text-3xl md:text-4xl text-gray-900 mb-6',

  // Subheaders
  h3: 'font-sans text-xl md:text-2xl font-medium text-gray-800',

  // Sub-subheaders
  h4: 'font-sans text-lg md:text-xl font-medium text-gray-700',

  // Navigation & Main List Items
  navItem: 'font-sans text-2xl md:text-3xl font-light',

  // Body Text (Paragraphs, Descriptions)
  body: 'font-sans text-xl md:text-2xl font-light leading-relaxed',

  // Smaller Body Text for dense content (About page prose)
  bodySmall: 'font-sans text-lg text-gray-600 font-light leading-loose',

  // Small Text (Footer, Metadata)
  small: 'text-sm tracking-widest uppercase',

  // Extra small text
  extraSmall: 'text-xs tracking-widest uppercase',

  // Links
  link: 'transition-colors duration-300 cursor-pointer',
};

export const LAYOUT = {
  // Main white card container
  mainCard: 'bg-white w-[calc(100vw-2rem)] md:w-[calc(100vw-4rem)] max-w-[95rem] h-[90vh] rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col overflow-hidden relative',
  contentContainer: 'w-full max-w-6xl mx-auto px-6 md:px-16 py-8',
  flexCenter: 'flex items-center justify-center',
};

export const MARQUEE = {
  REPETITIONS: 50,
  ANIMATION_DURATION: 450,
} as const;