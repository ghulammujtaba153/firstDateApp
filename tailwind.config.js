/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F48681",
        bgprimary: "#e69491",
      },
      animation: {
        ping: "ping 2s linear infinite",
      },
      keyframes: {
        ping: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.5)", opacity: "0.5" },
        },
      },
      
    },
  },
  plugins: [],
}
