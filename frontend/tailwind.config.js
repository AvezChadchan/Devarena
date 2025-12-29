/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/app/**/*.{js,ts,jsx,tsx}",
  "./src/components/**/*.{js,ts,jsx,tsx}",
  "./app/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    colors: {
      primary: "#53d22d",
      "primary-hover": "#46b026",
      "background-dark": "#0f1115",
      "surface-dark": "#181b21",
    },
    fontFamily: {
      display: ["Manrope", "sans-serif"],
    },
  },
};
export const plugins = [];
