/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6F0",
        "cream-deep": "#F2EAE0",
        "cream-line": "#E5DBCB",
        ink: "#2C221E",
        emerald: {
          DEFAULT: "#9C5247",
          soft: "#B56B60",
          deep: "#7E3F35",
        },
        terracotta: {
          DEFAULT: "#9C5247",
          soft: "#B56B60",
          deep: "#7E3F35",
        },
        gold: {
          DEFAULT: "#7E3F35",
          light: "#DFB283",
          pale: "#F5ECE0",
        },
        rose: {
          DEFAULT: "#C06E61",
          soft: "#DFB3AA",
        },
        orange: {
          50: "#FAF6F0",
          100: "#E5DBCB",
          200: "#DFB283",
          400: "#7E3F35",
          500: "#9C5247",
          600: "#7E3F35",
          700: "#5D2B23",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      maxWidth: {
        wrap: "1400px",
      },
      boxShadow: {
        soft: "0 20px 50px -20px rgba(33, 29, 25, 0.25)",
        card: "0 14px 34px -16px rgba(30, 59, 46, 0.28)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drawLine: {
          "0%": { strokeDashoffset: "1400" },
          "100%": { strokeDashoffset: "0" },
        },
        floatSlow: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.9s cubic-bezier(.22,1,.36,1) forwards",
        drawLine: "drawLine 2.6s cubic-bezier(.22,1,.36,1) forwards",
        floatSlow: "floatSlow 6s ease-in-out infinite",
        shimmer: "shimmer 6s ease-in-out infinite alternate",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};
