type environmentName =
  'API_HOST' |
  'HOST' |
  'PORT' |
  'LOGIN_URL' |
  'LOGOUT_URL' |
  'MACVIEW_ORDERS_URL' |
  'MACVIEW_CHANGE_PASSWORD_URL' |
  'JWT_COOKIE_NAME' |
  'JWT_REFRESH_TOKEN_COOKIE_NAME' |
  'ENABLE_PASSING_JWT_IN_URL' |
  'SENTRY_DSN' |
  'IMAGE_ROOT' |
  'ICON_ROOT' |
  'MACVIEW_URL' |
  'EK';
import { isNullOrEmpty } from './mcs-object.function';

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
    case 'MACVIEW_ORDERS_URL':
      overrideValue = window['ENV_CONFIG'].macviewOrdersUrl;
      break;
    case 'MACVIEW_CHANGE_PASSWORD_URL':
      overrideValue = window['ENV_CONFIG'].macviewChangePasswordUrl;
      break;
    case 'JWT_COOKIE_NAME':
      overrideValue = window['ENV_CONFIG'].jwtCookieName;
      break;
    case 'JWT_REFRESH_TOKEN_COOKIE_NAME':
      overrideValue = window['ENV_CONFIG'].jwtRefreshTokenCookieName;
      break;
    case 'ENABLE_PASSING_JWT_IN_URL':
      overrideValue = window['ENV_CONFIG'].enablePassingJwtInUrl;
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
    case 'MACVIEW_URL':
      overrideValue = window['ENV_CONFIG'].macviewUrl;
      break;
    case 'EK':
      overrideValue = window['ENV_CONFIG'].ek;
      break;
    default:
      return defaultValue;
  }

  return isNullOrEmpty(overrideValue) ? defaultValue : overrideValue;
}
