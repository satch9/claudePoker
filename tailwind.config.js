/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        poker: {
          green: "#0F5132",
          felt: "#1B5E20",
          chip: {
            white: "#FFFFFF",
            red: "#DC2626",
            blue: "#2563EB",
            green: "#16A34A",
            black: "#000000",
            purple: "#7C3AED",
            orange: "#EA580C",
            yellow: "#CA8A04",
          },
        },
      },
      animation: {
        "card-deal": "cardDeal 0.5s ease-out",
        "chip-bet": "chipBet 0.3s ease-out",
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        cardDeal: {
          "0%": {
            transform: "translateY(-100px) rotate(180deg)",
            opacity: "0",
          },
          "100%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
        },
        chipBet: {
          "0%": { transform: "scale(0.8) translateY(20px)", opacity: "0" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
