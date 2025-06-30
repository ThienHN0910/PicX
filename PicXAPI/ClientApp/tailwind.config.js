/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in',
            },
            keyframes: {
                fadeIn: {
                    'from': { opacity: 0 },
                    'to': { opacity: 1 },
                },
            },
            backgroundImage: {
                'main-gradient': 'linear-gradient(180deg, rgb(66,230,149) 0%, rgb(59,178,184) 100%)',
            },
        },
    },
    plugins: [],
}