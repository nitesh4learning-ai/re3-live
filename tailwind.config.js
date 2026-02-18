/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        're3-purple': '#9333EA',
        're3-rethink': '#3B6B9B',
        're3-rediscover': '#E8734A',
        're3-reinvent': '#2D8A6E',
      },
    },
  },
  plugins: [],
};
