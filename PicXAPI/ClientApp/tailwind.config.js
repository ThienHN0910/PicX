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
        },
    },
    plugins: [],
}