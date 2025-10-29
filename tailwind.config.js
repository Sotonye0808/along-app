/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        alonggreen: "#00623B",
        basewhite: "#f7f7f7",
        baseblack: "#232323",
        primary: "#ff00ff",
        success: "#a4f4e7",
        warning: "#f4c790",
        error: "#e4626f",
        primary100: "#00a23b",
        primary200: "#00c23b",
        primary300: "#00ff3b",
        primary400: "#00523b",
        primary500: "#006200",
        neutral100: "#e4e4e4",
        neutral200: "#d0d0d0",
        neutral300: "#bdbdbd",
        neutral400: "#aaaaaa",
        neutral500: "#363636",
        success200: "#15b097",
        success300: "#0b7b69",
        error200: "#c03744",
        error300: "#8c1823",
        warning200: "#eda145",
        warning300: "#cc7914",
      },
    },
  },
  plugins: [],
};
