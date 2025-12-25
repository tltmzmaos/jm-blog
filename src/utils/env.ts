interface EnvConfig {
  githubToken?: string;
  gistId?: string;
  baseUrl: string;
}

export function getEnvConfig(): EnvConfig {
  return {
    githubToken: import.meta.env.PUBLIC_GITHUB_TOKEN || undefined,
    gistId: import.meta.env.PUBLIC_GIST_ID || undefined,
    baseUrl: import.meta.env.BASE_URL || '/',
  };
}

export function isLikeSystemEnabled(): boolean {
  const { githubToken, gistId } = getEnvConfig();
  return !!(githubToken && gistId && githubToken !== 'undefined');
}

export function isDev(): boolean {
  return import.meta.env.DEV;
}

export function isProd(): boolean {
  return import.meta.env.PROD;
}

export function shouldShowDrafts(): boolean {
  return import.meta.env.DEV;
}
