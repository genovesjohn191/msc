export class CoreConfig {

  /** API Host */
  private _apiHost: string;
  public get apiHost(): string {
    return this._apiHost;
  }
  public set apiHost(value: string) {
    this._apiHost = value;
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
}
