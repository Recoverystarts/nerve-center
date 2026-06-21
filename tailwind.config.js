/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'holo-bg': '#02050a',
        'holo-panel': '#0a101f',
        'holo-edge': '#f59e0b',
      }
    },
  },
  plugins: [],
}
