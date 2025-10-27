import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          DEFAULT: '#06b6d4',
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        fire: {
          DEFAULT: '#ea580c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
      },
      fontWeight: {
        'display': '700',
        'body': '400',
        'mono': '500',
      },
      letterSpacing: {
        'display': '-0.02em',
        'tight': '-0.01em',
      },
      borderRadius: {
        'panel': '0.75rem',
      },
      boxShadow: {
        'glow-sm': '0 0 8px rgba(6, 182, 212, 0.3)',
        'glow': '0 0 16px rgba(6, 182, 212, 0.4)',
        'glow-lg': '0 0 24px rgba(6, 182, 212, 0.5)',
        'panel': '0 1px 3px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
