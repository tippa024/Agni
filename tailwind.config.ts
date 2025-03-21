import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/Mediums/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#3A2E1F", // Darker brown for main text
            maxWidth: "none",
            h1: {
              color: "#E6B325", // Golden yellow (ghee)
              fontWeight: "700",
            },
            h2: {
              color: "#D9A319", // Slightly darker gold
              fontWeight: "600",
            },
            h3: {
              color: "#C69214", // Even darker gold for hierarchy
              fontWeight: "600",
            },
            h4: {
              color: "#B4860F", // Continuing the hierarchy
            },
            h5: {
              color: "#A2760E", // Continuing the hierarchy
            },
            h6: {
              color: "#90660D", // Continuing the hierarchy
            },
            strong: {
              color: "#8B5E00", // Rich brown for emphasis
              fontWeight: "600",
            },
            em: {
              color: "#6B4A00", // Darker brown for italics
              fontStyle: "italic",
            },
            code: {
              color: "#FFFFFF", // White text for code
              backgroundColor: "#6B1178", // Golden brown background
              borderRadius: "0.25rem",
              padding: "0.125rem 0.25rem",
              border: "1px solid rgba(230, 179, 37, 0.3)", // Subtle gold border
              fontFamily: "monospace",
            },
            pre: {
              backgroundColor: "#7F3159", // Slightly lighter dark golden brown for code blocks
              border: "1px solid rgba(230, 179, 37, 0.3)",
              padding: "1rem",
              code: {
                backgroundColor: "transparent",
                border: "none",
                padding: 0,
                color: "#FFFFFF", // White text in code blocks
              },
            },
            a: {
              color: "#D9A319", // Gold for links
              textDecoration: "underline",
              textDecorationColor: "rgba(230, 179, 37, 0.4)",
              "&:hover": {
                color: "#E6B325", // Brighter gold on hover
                textDecorationColor: "rgba(230, 179, 37, 0.8)",
              },
            },
            blockquote: {
              borderLeftColor: "#E6B325", // Gold border for blockquotes
              backgroundColor: "rgba(230, 179, 37, 0.05)", // Very subtle gold background
              color: "#5A4A33", // Slightly lighter than main text
            },
            ul: {
              li: {
                "&::before": {
                  backgroundColor: "#C69214", // Gold bullets
                },
              },
            },
            ol: {
              li: {
                "&::before": {
                  color: "#C69214", // Gold numbers
                  fontWeight: "600",
                },
              },
            },
            hr: {
              borderColor: "rgba(230, 179, 37, 0.3)", // Subtle gold divider
            },
            table: {
              thead: {
                borderBottomColor: "#E6B325", // Gold table header border
                th: {
                  color: "#8B5E00", // Rich brown for table headers
                },
              },
              tbody: {
                tr: {
                  borderBottomColor: "rgba(230, 179, 37, 0.2)", // Subtle gold row dividers
                },
              },
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
