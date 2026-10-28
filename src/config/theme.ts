// Single place to change the look of the site.
// Colours and fonts used by Tailwind all come from this file.
// "ink" = deep navy for text and dark surfaces, "brand" = orange accent for buttons and links,
// "deep" = the teal, blue and violet used for gradient bands.

export const theme = {
  colors: {
    ink: {
      50: "#f3f6fb",
      100: "#e3eaf5",
      200: "#c7d3e8",
      300: "#9fb1d1",
      400: "#7185ad",
      500: "#4f6390",
      600: "#3a4d78",
      700: "#2b3b60",
      800: "#1d2b4c",
      900: "#121e3a",
      950: "#0a1330",
    },
    // Burnt orange taken from the Sangama Traders logo.
    brand: {
      50: "#fff4ec",
      100: "#ffe4d1",
      200: "#ffc7a1",
      500: "#f26b1d",
      600: "#d9480f",
      700: "#b93a0a",
    },
    // Gradient stops: teal to blue to violet.
    deep: {
      teal: "#0e6b86",
      blue: "#1e56a6",
      violet: "#4a3a98",
      navy: "#0b1f4d",
    },
  },
  // Headings use Barlow Condensed (self-hosted through @fontsource, imported in src/app/layout.tsx).
  // Body text uses the system font stack, so there is nothing extra to download for it.
  fonts: {
    sans: [
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ],
    display: ["Barlow Condensed", "Arial Narrow", "ui-sans-serif", "system-ui", "sans-serif"],
  } as Record<string, string[]>,
};
