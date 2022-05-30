export enum McsEnvironmentVariables {
  ApiHost = 0,
  Host,
  Port,
  LoginUrl,
  LogoutUrl,
  MacviewOrdersUrl,
  MacviewChangePasswordUrl,
  MacviewManageUsersUrl,
  McsTermsAndConditionsUrl,
  McsInviewUrl,
  McsTrendDsmUrl,
  KnowledgeBaseUrl,
  McsSessionExtensionWindowInSeconds,
  SentryDns,
  ImageRoot,
  IconRoot,
  MacviewUrl,
  Ek
}

import { isNullOrEmpty } from './mcs-object.function';

export function resolveEnvVar(envName: McsEnvironmentVariables, defaultValue: string = ''): string {

  let windowEnvironmentConfig = window['ENV_CONFIG'];
  if (isNullOrEmpty(windowEnvironmentConfig)) {
    return defaultValue;
  }

  let overrideValue: string;

  switch (envName) {
    case McsEnvironmentVariables.ApiHost:
      overrideValue = windowEnvironmentConfig.apiHost;
      break;
    case McsEnvironmentVariables.Host:
      overrideValue = windowEnvironmentConfig.host;
      break;
    case McsEnvironmentVariables.Port:
      overrideValue = windowEnvironmentConfig.port;
      break;
    case McsEnvironmentVariables.LoginUrl:
      overrideValue = windowEnvironmentConfig.loginUrl;
      break;
    case McsEnvironmentVariables.LogoutUrl:
      overrideValue = windowEnvironmentConfig.logoutUrl;
      break;
    case McsEnvironmentVariables.MacviewOrdersUrl:
      overrideValue = windowEnvironmentConfig.macviewOrdersUrl;
      break;
    case McsEnvironmentVariables.MacviewChangePasswordUrl:
      overrideValue = windowEnvironmentConfig.macviewChangePasswordUrl;
      break;
    case McsEnvironmentVariables.MacviewManageUsersUrl:
      overrideValue = windowEnvironmentConfig.macviewManageUsersUrl;
      break;
    case McsEnvironmentVariables.McsTermsAndConditionsUrl:
      overrideValue = windowEnvironmentConfig.termsAndConditionsUrl;
      break;
    case McsEnvironmentVariables.McsInviewUrl:
      overrideValue = windowEnvironmentConfig.inviewUrl;
      break;
    case McsEnvironmentVariables.McsTrendDsmUrl:
      overrideValue = windowEnvironmentConfig.trendDsmUrl;
      break;
    case McsEnvironmentVariables.KnowledgeBaseUrl:
      overrideValue = windowEnvironmentConfig.knowledgeBaseUrl;
      break;
    case McsEnvironmentVariables.McsSessionExtensionWindowInSeconds:
      overrideValue = windowEnvironmentConfig.sessionExtensionWindowInSeconds;
      break;
    case McsEnvironmentVariables.SentryDns:
      overrideValue = windowEnvironmentConfig.sentryDsn;
      break;
    case McsEnvironmentVariables.ImageRoot:
      overrideValue = windowEnvironmentConfig.imageRoot;
      break;
    case McsEnvironmentVariables.IconRoot:
      overrideValue = windowEnvironmentConfig.iconRoot;
      break;
    case McsEnvironmentVariables.MacviewUrl:
      overrideValue = windowEnvironmentConfig.macviewUrl;
      break;
    case McsEnvironmentVariables.Ek:
      overrideValue = windowEnvironmentConfig.ek;
      break;
    default:
      return defaultValue;
  }

  return isNullOrEmpty(overrideValue) ? defaultValue : overrideValue;
}
