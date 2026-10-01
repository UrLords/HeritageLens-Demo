export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#eeebe3",
        ink: "#332e28",
        olive: "#777658",
        rust: "#a25f45",
        bronze: "#a25f45",
        panel: "#f6f3ec",
        line: "#d2cabb",
      },
      fontFamily: {
        display: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
