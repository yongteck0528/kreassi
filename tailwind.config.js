/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        // Brand colors — keep in sync with the design team's palette.
        darkPurple: '#371055',
        purple: {
          5: '#7C3DB0',
        },
      },
      backgroundImage: {
        // Only backgrounds actually used by components are registered here.
        'var-3': "url('/src/assets/Backgrounds/3.jpeg')",
        'var-7': "url('/src/assets/Backgrounds/7.jpeg')",
        'var-8': "url('/src/assets/Backgrounds/background_partner.png')",
        'var-gray':
          'linear-gradient(90deg,#aeb2b7 0%,#c7cbd1 15%,#e7eaee 35%,#ffffff 50%,#e7eaee 65%,#c7cbd1 85%,#aeb2b7 100%)',
        'var-gray-diagonal':
          'linear-gradient(135deg,#aeb2b7 0%,#c7cbd1 15%,#e7eaee 35%,#ffffff 50%,#e7eaee 65%,#c7cbd1 85%,#aeb2b7 100%)',
        'var-purple-gradient': 'linear-gradient(90deg, #371055 0%, #B76EFA 50%, #371055 100%)',
        'middle-gradient': "url('/src/assets/Backgrounds/middle-gradient.png')",
      },
    },
  },
}
