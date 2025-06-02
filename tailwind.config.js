const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Fira Code", "monospace"],
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontSize: "2.25rem",
              fontWeight: "700",
              lineHeight: "2.5rem",
            },
            h2: {
              fontSize: "1.875rem",
              fontWeight: "700",
              lineHeight: "2.25rem",
            },
            h3: {
              fontSize: "1.5rem",
              fontWeight: "600",
              lineHeight: "2rem",
            },
            h4: {
              fontSize: "1.25rem",
              fontWeight: "600",
              lineHeight: "1.75rem",
            },
          },
        },
      },
      animation: {
        blob: "blob 5.5s infinite ease-in-out",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "tranlate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
