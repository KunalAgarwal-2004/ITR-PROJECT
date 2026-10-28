/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDF4',
          100: '#E8F7EC',
          200: '#C7EED0',
          500: '#20A83A', // Primary Green Accent #20A83A
          600: '#1B8F31', // Hover state
          700: '#157327',
          900: '#0E4819'
        },
        surface: {
          white: '#FFFFFF',
          warm: '#FAFAFA',
          muted: '#F3F4F6'
        },
        content: {
          primary: '#222222', // Dark text #222222
          muted: '#6B7280',   // Muted text #6B7280
          subtle: '#9CA3AF'
        },
        border: {
          DEFAULT: '#E5E7EB', // Light borders #E5E7EB
          light: '#F3F4F6',
          strong: '#D1D5DB'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        hover: '0 4px 12px 0 rgba(0, 0, 0, 0.08)'
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '10px'
      }
    },
  },
  plugins: [],
}
