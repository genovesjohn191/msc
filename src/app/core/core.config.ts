import { McsNotificationConfig } from './models/mcs-notification-config';

export class CoreConfig {

  /** API Host */
  private _apiHost: string;
  public get apiHost(): string {
    return this._apiHost;
  }
  public set apiHost(value: string) {
    this._apiHost = value;
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

  /** Notification Configuration */
  private _notificationConfig: McsNotificationConfig;
  public get notification(): McsNotificationConfig {
    return this._notificationConfig;
  }
  public set notification(value: McsNotificationConfig) {
    this._notificationConfig = value;
  }
}
