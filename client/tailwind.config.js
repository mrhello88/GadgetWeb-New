/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          50: '#f0fdfa',   // Very light teal
          100: '#ccfbf1',  // Light teal
          200: '#99f6e4',  // Light teal
          300: '#5eead4',  // Medium light teal
          400: '#2dd4bf',  // Medium teal
          500: '#14b8a6',  // Main brand color (teal-500)
          600: '#0d9488',  // Dark teal
          700: '#0f766e',  // Darker teal
          800: '#115e59',  // Very dark teal
          900: '#134e4a',  // Darkest teal
        },
        
        // Secondary Colors
        secondary: {
          50: '#f8fafc',   // Light gray
          100: '#f1f5f9',  // Light gray
          200: '#e2e8f0',  // Medium light gray
          300: '#cbd5e1',  // Medium gray
          400: '#94a3b8',  // Medium gray
          500: '#64748b',  // Main secondary color
          600: '#475569',  // Dark gray
          700: '#334155',  // Darker gray
          800: '#1e293b',  // Very dark gray
          900: '#0f172a',  // Darkest gray
        },
        
        // Success Colors
        success: {
          50: '#f0fdf4',   // Very light green
          100: '#dcfce7',  // Light green
          200: '#bbf7d0',  // Light green
          300: '#86efac',  // Medium light green
          400: '#4ade80',  // Medium green
          500: '#22c55e',  // Main success color
          600: '#16a34a',  // Dark green
          700: '#15803d',  // Darker green
          800: '#166534',  // Very dark green
          900: '#14532d',  // Darkest green
        },
        
        // Warning Colors
        warning: {
          50: '#fffbeb',   // Very light yellow
          100: '#fef3c7',  // Light yellow
          200: '#fde68a',  // Light yellow
          300: '#fcd34d',  // Medium light yellow
          400: '#fbbf24',  // Medium yellow
          500: '#f59e0b',  // Main warning color
          600: '#d97706',  // Dark yellow
          700: '#b45309',  // Darker yellow
          800: '#92400e',  // Very dark yellow
          900: '#78350f',  // Darkest yellow
        },
        
        // Error Colors
        error: {
          50: '#fef2f2',   // Very light red
          100: '#fee2e2',  // Light red
          200: '#fecaca',  // Light red
          300: '#fca5a5',  // Medium light red
          400: '#f87171',  // Medium red
          500: '#ef4444',  // Main error color
          600: '#dc2626',  // Dark red
          700: '#b91c1c',  // Darker red
          800: '#991b1b',  // Very dark red
          900: '#7f1d1d',  // Darkest red
        },
        
        // Info Colors
        info: {
          50: '#eff6ff',   // Very light blue
          100: '#dbeafe',  // Light blue
          200: '#bfdbfe',  // Light blue
          300: '#93c5fd',  // Medium light blue
          400: '#60a5fa',  // Medium blue
          500: '#3b82f6',  // Main info color
          600: '#2563eb',  // Dark blue
          700: '#1d4ed8',  // Darker blue
          800: '#1e40af',  // Very dark blue
          900: '#1e3a8a',  // Darkest blue
        }
      },
      
      // Custom spacing that matches the color theme
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      // Animation and transition consistency
      transitionDuration: {
        '400': '400ms',
      },
      
      // Box shadow consistency
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(20, 184, 166, 0.15)',
        'brand-lg': '0 10px 25px -3px rgba(20, 184, 166, 0.1), 0 4px 6px -2px rgba(20, 184, 166, 0.05)',
      }
    },
  },
  plugins: [],
};
