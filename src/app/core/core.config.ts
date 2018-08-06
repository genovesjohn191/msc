export class CoreConfig {

  /** API Host */
  private _apiHost: string;
  public get apiHost(): string {
    return this._apiHost;
  }
  public set apiHost(value: string) {
    this._apiHost = value;
  }

  /** Macquarie View URL */
  private _macviewUrl: string;
  public get macviewUrl(): string {
    return this._macviewUrl;
  }
  public set macviewUrl(value: string) {
    this._macviewUrl = value;
  }

  /**
   * Encryption public Key
   *
   * `@Note:` This should be used only for those information
   * that should be encrypted in the storage or cookie
   */
  private _encryptionKey: string;
  public get enryptionKey(): string {
    return this._encryptionKey;
  }
  public set enryptionKey(value: string) {
    this._encryptionKey = value;
  }

  /** Login Url for Authentication */
  private _loginUrl: string;
  public get loginUrl(): string {
    return this._loginUrl;
  }
  public set loginUrl(value: string) {
    this._loginUrl = value;
  }

  /** Logout Url for Authentication */
  private _logoutUrl: string;
  public get logoutUrl(): string {
    return this._logoutUrl;
  }
  public set logoutUrl(value: string) {
    this._logoutUrl = value;
  }

  /** Image Root */
  private _imageRoot: string;
  public get imageRoot(): string {
    return this._imageRoot;
  }
  public set imageRoot(value: string) {
    this._imageRoot = value;
  }

  /** Icon Root */
  private _iconRoot: string;
  public get iconRoot(): string {
    return this._iconRoot;
  }
  public set iconRoot(value: string) {
    this._iconRoot = value;
  }

  /** Orders URL */
  private _macviewOrdersUrl: string;
  public get macviewOrdersUrl(): string {
    return this._macviewOrdersUrl;
  }
  public set macviewOrdersUrl(value: string) {
    this._macviewOrdersUrl = value;
  }

  /** Change Password URL */
  private _macviewChangePasswordUrl: string;
  public get macviewChangePasswordUrl(): string {
    return this._macviewChangePasswordUrl;
  }
  public set macviewChangePasswordUrl(value: string) {
    this._macviewChangePasswordUrl = value;
  }
}
