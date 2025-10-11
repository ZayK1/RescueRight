/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./App.{js,jsx,ts,tsx}",
      "./app/**/*.{js,jsx,ts,tsx}",
      "./components/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          'rescue-blue': '#3B82F6',
          'rescue-teal': '#00A896',
          'medical-success': '#059669',
          'medical-warning': '#F59E0B',
          'medical-error': '#DC2626',
        },
      },
    },
    plugins: [],
  }