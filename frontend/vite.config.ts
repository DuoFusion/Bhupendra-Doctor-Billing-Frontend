import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// const PORT = import.meta.

export default defineConfig({
  plugins: [tailwindcss()],

  // preview: {
  //   port: PORT,
  //   strictPort: true,
  // },
});
