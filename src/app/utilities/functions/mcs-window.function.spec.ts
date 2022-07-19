import {
  McsEnvironmentVariables,
  resolveEnvVar
} from "./mcs-window.function";

describe('Window Function', () => {

  describe('resolveEnvVar', () => {
    it(`should return the environment value if the environment variable is apiHost`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.ApiHost);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is host`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.Host);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is port`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.Port);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is loginUrl`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.LoginUrl);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is logoutUrl`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.LogoutUrl);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is macviewOrdersUrl`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.MacviewOrdersUrl);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is macviewChangePasswordUrl`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.MacviewChangePasswordUrl);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is macviewManageUsersUrl`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.MacviewManageUsersUrl);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is termsAndConditionsUrl`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.McsTermsAndConditionsUrl);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is inviewUrl`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.McsInviewUrl);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is trendDsmUrl`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.McsTrendDsmUrl);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is knowledgeBaseUrl`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.KnowledgeBaseUrl);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is sessionExtensionWindowInSeconds`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.McsSessionExtensionWindowInSeconds);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is sentryDsn`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.SentryDns);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is imageRoot`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.ImageRoot);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is iconRoot`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.IconRoot);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is macviewUrl`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.MacviewUrl);
      expect(overrideValue).toBe('');
    });

    it(`should return the environment value if the environment variable is ek`, () => {
     
      let overrideValue = resolveEnvVar(McsEnvironmentVariables.Ek);
      expect(overrideValue).toBe('');
    });
  });
});