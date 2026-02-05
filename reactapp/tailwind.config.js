/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shadcn UI color mappings
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Theme-aware colors using CSS variables
        theme: {
          'bg-primary': 'var(--color-bg-primary)',
          'bg-secondary': 'var(--color-bg-secondary)',
          'bg-tertiary': 'var(--color-bg-tertiary)',
          'bg-elevated': 'var(--color-bg-elevated)',
          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-tertiary': 'var(--color-text-tertiary)',
          'text-muted': 'var(--color-text-muted)',
          'border-primary': 'var(--color-border-primary)',
          'border-secondary': 'var(--color-border-secondary)',
        },
        // Accent colors
        accent: {
          primary: 'var(--color-accent-primary)',
          'primary-hover': 'var(--color-accent-primary-hover)',
          'primary-light': 'var(--color-accent-primary-light)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          hover: 'var(--color-success-hover)',
          light: 'var(--color-success-light)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          hover: 'var(--color-warning-hover)',
          light: 'var(--color-warning-light)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          hover: 'var(--color-danger-hover)',
          light: 'var(--color-danger-light)',
        },
        // Additional accent colors
        purple: {
          DEFAULT: 'var(--color-purple)',
          hover: 'var(--color-purple-hover)',
          light: 'var(--color-purple-light)',
        },
        orange: {
          DEFAULT: 'var(--color-orange)',
          hover: 'var(--color-orange-hover)',
          light: 'var(--color-orange-light)',
        },
        teal: {
          DEFAULT: 'var(--color-teal)',
          hover: 'var(--color-teal-hover)',
          light: 'var(--color-teal-light)',
        },
        pink: {
          DEFAULT: 'var(--color-pink)',
          hover: 'var(--color-pink-hover)',
          light: 'var(--color-pink-light)',
        },
        // Visualization colors
        viz: {
          current: 'var(--color-viz-current)',
          found: 'var(--color-viz-found)',
          visited: 'var(--color-viz-visited)',
          comparing: 'var(--color-viz-comparing)',
          sorted: 'var(--color-viz-sorted)',
          default: 'var(--color-viz-default)',
        },
        // Code syntax colors
        code: {
          keyword: 'var(--color-code-keyword)',
          string: 'var(--color-code-string)',
          number: 'var(--color-code-number)',
          comment: 'var(--color-code-comment)',
          function: 'var(--color-code-function)',
          variable: 'var(--color-code-variable)',
          type: 'var(--color-code-type)',
        },
      },
      backgroundColor: {
        'theme-primary': 'var(--color-bg-primary)',
        'theme-secondary': 'var(--color-bg-secondary)',
        'theme-tertiary': 'var(--color-bg-tertiary)',
        'theme-elevated': 'var(--color-bg-elevated)',
      },
      textColor: {
        'theme-primary': 'var(--color-text-primary)',
        'theme-secondary': 'var(--color-text-secondary)',
        'theme-tertiary': 'var(--color-text-tertiary)',
        'theme-muted': 'var(--color-text-muted)',
      },
      borderColor: {
        'theme-primary': 'var(--color-border-primary)',
        'theme-secondary': 'var(--color-border-secondary)',
        'theme-muted': 'var(--color-text-muted)',
      },
      gradientColorStops: {
        'theme-primary': 'var(--color-bg-primary)',
        'theme-secondary': 'var(--color-bg-secondary)',
        'theme-tertiary': 'var(--color-bg-tertiary)',
        'theme-elevated': 'var(--color-bg-elevated)',
        'theme-muted': 'var(--color-text-muted)',
        'success': 'var(--color-success)',
        'success-hover': 'var(--color-success-hover)',
        'warning': 'var(--color-warning)',
        'warning-hover': 'var(--color-warning-hover)',
        'danger': 'var(--color-danger)',
        'danger-hover': 'var(--color-danger-hover)',
        'orange': 'var(--color-orange)',
        'orange-hover': 'var(--color-orange-hover)',
        'purple': 'var(--color-purple)',
        'purple-hover': 'var(--color-purple-hover)',
        'pink': 'var(--color-pink)',
        'pink-hover': 'var(--color-pink-hover)',
        'teal': 'var(--color-teal)',
        'teal-hover': 'var(--color-teal-hover)',
        'accent-primary': 'var(--color-accent-primary)',
        'accent-primary-hover': 'var(--color-accent-primary-hover)',
      },
      ringColor: {
        'accent-primary': 'var(--color-accent-primary)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'danger': 'var(--color-danger)',
        'purple': 'var(--color-purple)',
      },
      boxShadowColor: {
        'accent-primary': 'var(--color-accent-primary)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'danger': 'var(--color-danger)',
        'orange': 'var(--color-orange)',
        'purple': 'var(--color-purple)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
