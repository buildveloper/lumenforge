/**
 * Clerk's prebuilt widgets shipped in their own default palette, so sign-in
 * looked like a different product than the app around it.
 *
 * These point at our CSS custom properties rather than at literal colours.
 * Clerk injects them as custom properties on its own root element, which sits
 * inside `.dark` or `:root`, so theme switching needs no JavaScript and this
 * file never has to know which mode is active.
 *
 * Left unannotated on purpose: Clerk's `Appearance` type is not exported from a
 * public entry point in v7, and inline inference lets the `ClerkProvider` prop
 * validate the shape at the one place it is used.
 */
export const clerkAppearance = {
  variables: {
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    fontSize: "13px",
    borderRadius: "5px",

    colorBackground: "var(--popover)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorPrimary: "var(--primary)",
    colorDanger: "var(--negative)",
    colorSuccess: "var(--positive)",
    colorWarning: "var(--negative)",
    colorNeutral: "var(--foreground)",

    colorInputBackground: "var(--background)",
    colorInputText: "var(--foreground)",
    colorBorder: "var(--border)",
    colorInput: "var(--input)",
    colorShadow: "transparent",
  },

  elements: {
    rootBox: "w-full",
    card: "border border-border bg-popover shadow-overlay rounded-xl",
    headerTitle: "tracking-[-0.02em] text-[20px] font-semibold",
    headerSubtitle: "text-[13px]",
    socialButtonsBlockButton:
      "border border-border bg-transparent hover:bg-surface-raised transition-colors",
    formButtonPrimary:
      "bg-primary text-primary-foreground hover:opacity-88 normal-case text-[13px] font-medium",
    formFieldInput: "border border-input bg-background focus:border-ring",
    footerActionLink: "text-signal hover:opacity-80",
    dividerText: "text-[11px]",
    identityPreviewEditButton: "text-signal",
  },
};
