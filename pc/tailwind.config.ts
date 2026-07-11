import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // PC Dark Bloomberg
        'terminal': {
          bg: '#0A0A0C',
          card: '#131316',
          border: '#1E1E24',
          text: '#E4E4E7',
          muted: '#71717A',
          accent: '#FF8800',
          danger: '#FF4444',
          success: '#00C853',
          warning: '#FFD600',
          info: '#2979FF',
        },
        // Mobile iOS
        'ios': {
          bg: '#F2F2F7',
          card: '#FFFFFF',
          text: '#1C1C1E',
          muted: '#8E8E93',
          red: '#FF3B30',
          orange: '#FF9500',
          green: '#34C759',
          blue: '#007AFF',
          separator: '#C6C6C8',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'PingFang SC', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'mobile': '414px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
