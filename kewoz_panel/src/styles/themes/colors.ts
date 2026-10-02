export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

export interface ThemeColors {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
  bg: string;
  bgElevated: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textMuted: string;
  textSubtle: string;
}

const createColorScale = (base: Record<keyof Omit<ColorScale, 'DEFAULT'>, string>): ColorScale => ({
  50: base[50],
  100: base[100],
  200: base[200],
  300: base[300],
  400: base[400],
  500: base[500],
  600: base[600],
  700: base[700],
  800: base[800],
  900: base[900],
  950: base[950],
});

export const lightColors: ThemeColors = {
  primary: createColorScale({
    50: 'rgb(254, 252, 232)',
    100: 'rgb(254, 249, 195)',
    200: 'rgb(254, 240, 138)',
    300: 'rgb(253, 224, 71)',
    400: 'rgb(250, 204, 21)',
    500: 'rgb(234, 179, 8)',
    600: 'rgb(202, 138, 4)',
    700: 'rgb(161, 98, 7)',
    800: 'rgb(133, 77, 14)',
    900: 'rgb(113, 63, 18)',
    950: 'rgb(69, 26, 3)',
  }),
  secondary: createColorScale({
    50: 'rgb(255, 255, 255)',
    100: 'rgb(249, 250, 251)',
    200: 'rgb(243, 244, 246)',
    300: 'rgb(229, 231, 235)',
    400: 'rgb(209, 213, 219)',
    500: 'rgb(255, 255, 255)',
    600: 'rgb(249, 250, 251)',
    700: 'rgb(243, 244, 246)',
    800: 'rgb(229, 231, 235)',
    900: 'rgb(209, 213, 219)',
    950: 'rgb(8, 47, 73)',
  }),
  neutral: createColorScale({
    50: 'rgb(249, 250, 251)',
    100: 'rgb(243, 244, 246)',
    200: 'rgb(229, 231, 235)',
    300: 'rgb(209, 213, 219)',
    400: 'rgb(156, 163, 175)',
    500: 'rgb(107, 114, 128)',
    600: 'rgb(75, 85, 99)',
    700: 'rgb(55, 65, 81)',
    800: 'rgb(31, 41, 55)',
    900: 'rgb(17, 24, 39)',
    950: 'rgb(3, 7, 18)',
  }),
  success: createColorScale({
    50: 'rgb(240, 253, 244)',
    100: 'rgb(220, 252, 231)',
    200: 'rgb(187, 247, 208)',
    300: 'rgb(134, 239, 172)',
    400: 'rgb(74, 222, 128)',
    500: 'rgb(16, 185, 129)',
    600: 'rgb(5, 150, 105)',
    700: 'rgb(4, 120, 87)',
    800: 'rgb(6, 95, 70)',
    900: 'rgb(6, 78, 59)',
    950: 'rgb(2, 44, 34)',
  }),
  warning: createColorScale({
    50: 'rgb(255, 251, 235)',
    100: 'rgb(254, 243, 199)',
    200: 'rgb(253, 230, 138)',
    300: 'rgb(252, 211, 77)',
    400: 'rgb(251, 191, 36)',
    500: 'rgb(245, 158, 11)',
    600: 'rgb(217, 119, 6)',
    700: 'rgb(180, 83, 9)',
    800: 'rgb(146, 64, 14)',
    900: 'rgb(120, 53, 15)',
    950: 'rgb(67, 20, 7)',
  }),
  error: createColorScale({
    50: 'rgb(254, 242, 242)',
    100: 'rgb(254, 226, 226)',
    200: 'rgb(254, 202, 202)',
    300: 'rgb(252, 165, 165)',
    400: 'rgb(248, 113, 113)',
    500: 'rgb(239, 68, 68)',
    600: 'rgb(220, 38, 38)',
    700: 'rgb(185, 28, 28)',
    800: 'rgb(153, 27, 27)',
    900: 'rgb(127, 29, 29)',
    950: 'rgb(69, 10, 10)',
  }),
  info: createColorScale({
    50: 'rgb(240, 249, 255)',
    100: 'rgb(224, 242, 254)',
    200: 'rgb(186, 230, 253)',
    300: 'rgb(125, 211, 252)',
    400: 'rgb(56, 189, 248)',
    500: 'rgb(14, 165, 233)',
    600: 'rgb(2, 132, 199)',
    700: 'rgb(3, 105, 161)',
    800: 'rgb(7, 89, 133)',
    900: 'rgb(12, 74, 110)',
    950: 'rgb(8, 47, 73)',
  }),
  bg: 'rgb(255, 255, 255)',
  bgElevated: 'rgb(249, 250, 251)',
  surface: 'rgb(255, 255, 255)',
  surfaceElevated: 'rgb(249, 250, 251)',
  border: 'rgb(229, 231, 235)',
  text: 'rgb(17, 24, 39)',
  textMuted: 'rgb(75, 85, 99)',
  textSubtle: 'rgb(156, 163, 175)',
};

export const darkColors: ThemeColors = {
  ...lightColors,
  bg: 'rgb(17, 24, 39)',
  bgElevated: 'rgb(31, 41, 55)',
  surface: 'rgb(31, 41, 55)',
  surfaceElevated: 'rgb(55, 65, 81)',
  border: 'rgb(55, 65, 81)',
  text: 'rgb(243, 244, 246)',
  textMuted: 'rgb(156, 163, 175)',
  textSubtle: 'rgb(107, 114, 128)',
};

export const themeColors = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ThemeMode = keyof typeof themeColors;

export const isThemeMode = (mode: string): mode is ThemeMode => {
  return Object.keys(themeColors).includes(mode);
};
