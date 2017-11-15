type environmentName =
  'API_HOST' |
  'HOST' |
  'PORT' |
  'LOGIN_URL' |
  'LOGOUT_URL' |
  'JWT_COOKIE_NAME' |
  'SENTRY_DSN' |
  'IMAGE_ROOT' |
  'ICON_ROOT' |
  'MACQUARIE_VIEW_URL';

import {
  isNullOrEmpty
} from '.';

export function resolveEnvVar(envName: environmentName, defaultValue: string = ''): string {
  if (isNullOrEmpty(window['ENV_CONFIG'])) {
    return defaultValue;
  }

  let overrideValue: string;

  switch (envName) {
    case 'API_HOST':
      overrideValue = window['ENV_CONFIG'].apiHost;
      break;
    case 'HOST':
      overrideValue = window['ENV_CONFIG'].host;
      break;
    case 'PORT':
      overrideValue = window['ENV_CONFIG'].port;
      break;
    case 'LOGIN_URL':
      overrideValue = window['ENV_CONFIG'].loginUrl;
      break;
    case 'LOGOUT_URL':
      overrideValue = window['ENV_CONFIG'].logoutUrl;
      break;
    case 'JWT_COOKIE_NAME':
      overrideValue = window['ENV_CONFIG'].jwtCookieName;
      break;
    case 'SENTRY_DSN':
      overrideValue = window['ENV_CONFIG'].sentryDsn;
      break;
    case 'IMAGE_ROOT':
      overrideValue = window['ENV_CONFIG'].imageRoot;
      break;
    case 'ICON_ROOT':
      overrideValue = window['ENV_CONFIG'].iconRoot;
      break;
      case 'MACQUARIE_VIEW_URL':
      overrideValue = window['ENV_CONFIG'].macquarieViewUrl;
      break;
    default:
      return defaultValue;
  }

  return isNullOrEmpty(overrideValue) ? defaultValue : overrideValue;
}
