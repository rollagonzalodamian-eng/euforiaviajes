import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        euforia: {
          DEFAULT: '#00AEEF',
          dark: '#0090C5',
          light: '#E0F6FF',
          50: '#f0fbff',
          100: '#E0F6FF',
          500: '#00AEEF',
          600: '#0090C5',
          700: '#006F99',
        },
      },
    },
  },
  plugins: [],
}

export default config
