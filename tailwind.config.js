/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
    content: [
      "./src/app/**/*.{js,ts,jsx,tsx}", // ✅ Includes app router
      "./src/components/**/*.{js,ts,jsx,tsx}", // ✅ Includes components
      "./src/context/**/*.{js,ts,jsx,tsx}", // ✅ Includes context
      "./src/lib/**/*.{js,ts,jsx,tsx}", // ✅ Includes lib
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  
  export default tailwindConfig;  // ✅ Now using a named variable before export
  