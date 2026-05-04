/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#803d0a',
        'surface': '#fafaf5',
        'on-surface': '#1a1c19',
        'on-surface-variant': '#54433c',
        'surface-container-low': '#f4f4ef',
        'surface-container-high': '#e8e8e3',
        'secondary-container': '#f4ddb2',
        'success': '#2e7d32',
        'error': '#ba1a1a',
      },
      fontFamily: {
        'headline': ['Plus Jakarta Sans', 'sans-serif'],
        'body': ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
