const colors = require('tailwindcss/colors')

module.exports = {
    mode: 'jit',
    purge: ['./src/pages/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        colors: {
            ...colors,
        },
        extend: {
            fontFamily: {
                'sans': ['游ゴシック体', 'YuGothic', '游ゴシック', 'Yu Gothic', 'sans-serif'],
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
}
