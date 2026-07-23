export function isDev(): boolean {
  return import.meta.env.DEV;
}

export function isProd(): boolean {
  return import.meta.env.PROD;
}

export function shouldShowDrafts(): boolean {
  return import.meta.env.DEV;
}
