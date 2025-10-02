/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      backgroundImage: {
        'var-1': "url('/src/assets/Backgrounds/1.jpeg')",
        'var-2': "url('/src/assets/Backgrounds/2.jpeg')",
        'var-3': "url('/src/assets/Backgrounds/3.jpeg')",
        'var-4': "url('/src/assets/Backgrounds/4.jpeg')",
        'var-5': "url('/src/assets/Backgrounds/5.jpeg')",
        'var-6': "url('/src/assets/Backgrounds/6.jpeg')",
        'var-7': "url('/src/assets/Backgrounds/7.jpeg')",
        'var-gray': 'linear-gradient(90deg,#aeb2b7 0%,#c7cbd1 15%,#e7eaee 35%,#ffffff 50%,#e7eaee 65%,#c7cbd1 85%,#aeb2b7 100%)',
        'middle-gradient': "url('/src/assets/Backgrounds/middle-gradient.png')",
        'var-purple-gradient': 'linear-gradient(90deg, #371055 0%, #B76EFA 50%, #371055 100%)',
      },
      textColor: {
        darkPurple: '#371055',
      },
      colors: {
        purple: {
          5: '#7C3DB0',
        },
        plugins: [require('daisyui')],

        daisyui: {
          themes: ["light", "dark", "cupcake"],
        },
      }
    }
  }
}

