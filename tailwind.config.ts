import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],

  theme: {
    extend: {
      fontFamily: {
        display: ["Instrument Serif", "ui-serif", "Georgia", "serif"],
        heading: ["-apple-system", "BlinkMacSystemFont", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
        sans: ["-apple-system", "BlinkMacSystemFont", "system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "elev-1": "0 1px 0 0 rgba(37,99,235,.05), 0 1px 2px 0 rgba(37,99,235,.04)",
        "elev-2": "0 2px 4px -1px rgba(37,99,235,.07), 0 4px 12px -2px rgba(37,99,235,.05)",
        "elev-3": "0 4px 12px -2px rgba(37,99,235,.10), 0 12px 24px -8px rgba(37,99,235,.08)",
      },
      colors: {
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          soft: "hsl(var(--accent-soft))",
        },
        background: "var(--background)",
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        "border-subtle": "hsl(var(--border-subtle))",
        brand: {
          DEFAULT: "hsl(var(--brand))",
          ink: "hsl(var(--brand-ink))",
          soft: "hsl(var(--brand-soft))",
          strong: "hsl(var(--brand-2))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        foreground: "hsl(var(--foreground))",
        input: "hsl(var(--input))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        ring: "hsl(var(--ring))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "#ffffff",
          light: "hsl(var(--success-soft))",
          soft: "hsl(var(--success-soft))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
        },
        text: {
          DEFAULT: "hsl(var(--text))",
          2: "hsl(var(--text-2))",
          3: "hsl(var(--text-3))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "#ffffff",
          light: "hsl(var(--warning-soft))",
          soft: "hsl(var(--warning-soft))",
        },
        danger: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "#ffffff",
          light: "#FEE2E2",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "caret-blink": {
          "0%,70%,100%": {
            opacity: "1",
          },
          "20%,50%": {
            opacity: "0",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
} satisfies Config;
