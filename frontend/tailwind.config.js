export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f6faff",
        background: "#f6faff",
        "surface-low": "#ecf5fe",
        "surface-container": "#e6eff8",
        "surface-high": "#dbe4ed",
        "surface-white": "#ffffff",
        primary: "#006e2a",
        "primary-soft": "#00c853",
        "primary-ink": "#004c1b",
        secondary: "#5f5e5e",
        ink: "#141d23",
        muted: "#3c4a3c",
        outline: "#bbcbb8",
        error: "#ba1a1a",
        "error-soft": "#ffdad6",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
      boxShadow: {
        micro: "0 4px 12px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
