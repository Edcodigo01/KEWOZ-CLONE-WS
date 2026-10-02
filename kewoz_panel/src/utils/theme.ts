export const setThemeColors = (primary: string, secondary: string) => {
    const root = document.documentElement;

    // Helper to adjust brightness slightly
    const adjustLightness = (hex: string, amount: number) => {
        let [r, g, b] = hex
            .replace("#", "")
            .match(/.{1,2}/g)!
            .map((x) => parseInt(x, 16));

        r = Math.min(255, Math.max(0, r + amount));
        g = Math.min(255, Math.max(0, g + amount));
        b = Math.min(255, Math.max(0, b + amount));

        return `#${((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)
            .toUpperCase()}`;
    };

    // Apply base theme colors
    root.style.setProperty("--color-primary", primary);
    root.style.setProperty("--color-primary-light", adjustLightness(primary, 30));
    root.style.setProperty("--color-primary-dark", adjustLightness(primary, -30));
    root.style.setProperty("--color-button-text", secondary);

    // root.style.setProperty("--color-secondary", secondary);
    // root.style.setProperty("--color-secondary-light", adjustLightness(secondary, 20));

    // Optional – update some related values
    // root.style.setProperty("--color-border", adjustLightness(secondary, 20));
    // root.style.setProperty("--color-background", secondary);
};
