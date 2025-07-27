import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-kanit)', 'sans-serif'],
        kanit: ['var(--font-kanit)', 'sans-serif'],
        sora: ['var(--font-sora)', 'sans-serif'],
        darumadrop: ['"Darumadrop One"', 'cursive'],
      },
    },
  },
  plugins: [],
}
export default config
