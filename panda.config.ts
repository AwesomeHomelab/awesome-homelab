import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],
  preflight: true,
  include: ["./src/**/*.{ts,tsx}"],
  outdir: "styled-system",
  conditions: {
    extend: { dark: "@media (prefers-color-scheme: dark)" },
  },
  theme: {
    extend: {
      tokens: {
        shadows: {
          offset: { value: "3px 3px 0 {colors.border.strong}" },
          raised: { value: "5px 5px 0 {colors.border.strong}" },
        },
      },
      semanticTokens: {
        colors: {
          bg: {
            DEFAULT: { value: { base: "{colors.white}", _dark: "{colors.neutral.950}" } },
            subtle: { value: { base: "{colors.neutral.50}", _dark: "{colors.neutral.900}" } },
            surface: { value: { base: "{colors.white}", _dark: "{colors.neutral.900}" } },
            hero: { value: { base: "{colors.yellow.300}", _dark: "{colors.neutral.900}" } },
          },
          fg: {
            DEFAULT: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.50}" } },
            muted: { value: { base: "{colors.neutral.600}", _dark: "{colors.neutral.300}" } },
            headline: { value: { base: "{colors.black}", _dark: "{colors.yellow.300}" } },
          },
          border: {
            DEFAULT: { value: { base: "{colors.neutral.200}", _dark: "{colors.neutral.700}" } },
            strong: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.400}" } },
          },
          accent: {
            DEFAULT: { value: "{colors.yellow.300}" },
            hover: { value: "{colors.yellow.400}" },
            fg: { value: "{colors.neutral.900}" },
          },
          focus: { value: { base: "{colors.blue.700}", _dark: "{colors.blue.300}" } },
        },
      },
      textStyles: {
        display: {
          value: {
            fontSize: { base: "3xl", sm: "4xl", lg: "5xl" },
            fontWeight: "800",
            lineHeight: "1.08",
            letterSpacing: "-0.045em",
            textWrap: "balance",
          },
        },
        heading: {
          value: { fontSize: "2xl", fontWeight: "bold", lineHeight: "1.2", letterSpacing: "tight" },
        },
        eyebrow: {
          value: {
            fontSize: "xs",
            fontWeight: "bold",
            letterSpacing: "wider",
            textTransform: "uppercase",
          },
        },
      },
      layerStyles: {
        panel: {
          value: {
            bg: "bg.surface",
            borderWidth: "2px",
            borderColor: "border.strong",
            rounded: "xl",
            boxShadow: "offset",
          },
        },
      },
      recipes: {
        button: {
          className: "button",
          base: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2",
            minHeight: "11",
            px: "5",
            py: "2.5",
            borderWidth: "2px",
            borderColor: "border.strong",
            rounded: "lg",
            fontSize: "sm",
            fontWeight: "bold",
            lineHeight: "1.4",
            textAlign: "center",
            textDecoration: "none",
            boxShadow: "offset",
            cursor: "pointer",
            _hover: { boxShadow: "raised", textDecoration: "none" },
            _active: { boxShadow: "none" },
            _disabled: { opacity: "0.5", cursor: "not-allowed", boxShadow: "none" },
            "&[data-pending]": { cursor: "wait" },
          },
          variants: {
            visual: {
              solid: { bg: "accent", color: "accent.fg", _hover: { bg: "accent.hover" } },
              outline: { bg: "bg.surface", color: "fg", _hover: { bg: "bg.subtle" } },
            },
          },
          defaultVariants: { visual: "solid" },
        },
      },
    },
  },
  globalCss: {
    html: { colorScheme: "light dark", scrollPaddingTop: "6" },
    body: {
      bg: "bg",
      color: "fg",
      fontFamily: "sans",
      lineHeight: "1.65",
      overflowWrap: "anywhere",
    },
    a: { textDecoration: "underline", textUnderlineOffset: "0.2em" },
    ":where(a, button, input, summary):focus-visible": {
      outline: "3px solid token(colors.focus)",
      outlineOffset: "4px",
    },
    "::selection": { bg: "accent", color: "accent.fg" },
  },
});
