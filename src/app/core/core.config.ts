import { NotificationConfig } from './models/mcs-notification-config';

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

  /** Notification Configuration */
  private _notificationConfig: NotificationConfig;
  public get notification(): NotificationConfig {
    return this._notificationConfig;
  }
  public set notification(value: NotificationConfig) {
    this._notificationConfig = value;
  }
}
