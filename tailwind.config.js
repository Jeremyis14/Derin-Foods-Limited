/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981', // emerald-500
          light: '#34D399',   // emerald-400
          dark: '#059669',    // emerald-600
          darker: '#047857',  // emerald-700
        },
        dark: {
          DEFAULT: '#111827', // gray-900
          light: '#1F2937',   // gray-800
          lighter: '#374151',  // gray-700
        }
      },
    },
  },
  plugins: [],
}
