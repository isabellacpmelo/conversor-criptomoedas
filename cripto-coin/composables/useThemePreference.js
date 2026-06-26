import { computed, ref } from "vue";

export const THEME_OPTIONS = Object.freeze({
  DARK: "dark",
  LIGHT: "light",
});

const THEME_STORAGE_KEY = "crypto-converter.theme-preference";

const isClient = () => typeof window !== "undefined";

const normalizeTheme = (value) => {
  if (value === THEME_OPTIONS.DARK || value === THEME_OPTIONS.LIGHT) {
    return value;
  }
  return null;
};

// Local storage mapping for theme preference.
const ThemeStorage = {
  key: THEME_STORAGE_KEY,
  read() {
    if (!isClient()) {
      return null;
    }

    try {
      return normalizeTheme(window.localStorage.getItem(this.key));
    } catch {
      return null;
    }
  },
  write(theme) {
    if (!isClient()) {
      return;
    }

    try {
      window.localStorage.setItem(this.key, theme);
    } catch {
      // Ignore storage write errors (private mode, quota, etc.)
    }
  },
  clear() {
    if (!isClient()) {
      return;
    }

    try {
      window.localStorage.removeItem(this.key);
    } catch {
      // Ignore storage clear errors.
    }
  },
};

const getSystemTheme = () => {
  if (!isClient()) {
    return THEME_OPTIONS.DARK;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? THEME_OPTIONS.DARK
    : THEME_OPTIONS.LIGHT;
};

const applyThemeToDocument = (theme) => {
  if (!isClient()) {
    return;
  }

  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
};

const resolveInitialTheme = () => ThemeStorage.read() || getSystemTheme();

export function useThemePreference() {
  const currentTheme = ref(THEME_OPTIONS.DARK);

  const isDarkTheme = computed(() => currentTheme.value === THEME_OPTIONS.DARK);

  const setTheme = (theme) => {
    const normalized = normalizeTheme(theme);
    if (!normalized) {
      return;
    }

    currentTheme.value = normalized;
    applyThemeToDocument(normalized);
    ThemeStorage.write(normalized);
  };

  const toggleTheme = () => {
    const nextTheme = isDarkTheme.value ? THEME_OPTIONS.LIGHT : THEME_OPTIONS.DARK;
    setTheme(nextTheme);
  };

  const initializeTheme = () => {
    const initialTheme = resolveInitialTheme();
    setTheme(initialTheme);
  };

  return {
    currentTheme,
    isDarkTheme,
    initializeTheme,
    setTheme,
    toggleTheme,
    themeStorage: ThemeStorage,
    THEME_OPTIONS,
  };
}