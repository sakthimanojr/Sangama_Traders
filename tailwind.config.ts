import type { Config } from "tailwindcss";
import { theme } from "./src/config/theme";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: theme.colors,
      fontFamily: theme.fonts,
    },
  },
  plugins: [],
};

export default config;
