import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [
    require("@tailwindcss/typography"),
    // ...
  ],
  theme: {
    extend: {
      fontWeight: {
        lighter: "350",
      },
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-light": "rgb(var(--color-primary-light) / <alpha-value>)",
        "primary-dark": "rgb(var(--color-primary-dark) / <alpha-value>)",

        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        "foreground-light": "rgb(var(--color-foreground-light) / <alpha-value>)",
        "foreground-disabled": "rgb(var(--color-foreground-disabled) / <alpha-value>)",
        "foreground-error": "rgb(var(--color-foreground-error) / <alpha-value>)",
        "foreground-warning": "rgb(var(--color-foreground-warning) / <alpha-value>)",
        "foreground-success": "rgb(var(--foreground-success) / <alpha-value>)",

        background: "rgb(var(--color-background) / <alpha-value>)",
        "background-dark": "rgb(var(--color-background-dark) / <alpha-value>)",
        "background-light": "rgb(var(--color-background-light) / <alpha-value>)",
      },
    },
  },
};
export default config;
