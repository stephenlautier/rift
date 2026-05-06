// Auth config
export { authConfig, DEMO_USER, DEMO_USERNAME, DEMO_PASSWORD } from "./auth/config";
export type { RiftSession } from "./auth/config";

// Proxy factory
export { createAuthProxy } from "./proxy/createAuthProxy";

// Layout components
export { Header } from "./components/Header";
export { Nav } from "./components/Nav";
export { SignOutButton } from "./components/SignOutButton";

// Theme
export { ThemeProvider, useTheme, THEME_COOKIE_NAME } from "./theme/ThemeProvider";
export type { ThemeMode } from "./theme/ThemeProvider";
export { ThemeSwitcher } from "./theme/ThemeSwitcher";
export { ThemeScript } from "./theme/ThemeScript";

// Providers (client wrapper)
export { Providers } from "./providers/Providers";
