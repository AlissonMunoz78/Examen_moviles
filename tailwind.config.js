/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4: apunta a todos los archivos tsx/ts de la app
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Domino's Pizza
        dominos: {
          red: "#E31837",       // Rojo principal Domino's
          "red-dark": "#B01229", // Rojo oscuro para hover/pressed
          "red-light": "#FF4D6A",// Rojo claro para acentos
          blue: "#006491",      // Azul secundario Domino's
          "blue-dark": "#004E73",// Azul oscuro
          "blue-light": "#1A8AB5",// Azul claro
          white: "#FFFFFF",
          cream: "#FFF8F0",     // Fondo crema cálido
          gray: "#F5F5F5",      // Gris muy claro para cards
          "gray-mid": "#9CA3AF",// Gris medio para texto secundario
          "gray-dark": "#374151",// Gris oscuro para texto principal
          dark: "#1A1A2E",      // Casi negro para fondos oscuros
        }
      },
      fontFamily: {
        sans: ["System"],
      }
    }
  },
  plugins: []
};
