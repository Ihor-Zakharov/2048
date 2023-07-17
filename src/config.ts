export const config = {
  animation: {
    appearenceDuration: 100,
    combinationDuration: 100,
    combinationScaleAddition: 0.2,
    movementVelocity: 2
  },
  darkGameUrl: "https://theoddesy.github.io/2048/",
  originalGameUrl: "https://play2048.co/",
  phoneScaleFactorPixelData: 0.62,
  repoUrl: "https://github.com/Ihor-Zakharov/2048",
  swipeDistance: 40
} as const;

export type ConfigType = typeof config;
export type ConfigKey = keyof ConfigType;