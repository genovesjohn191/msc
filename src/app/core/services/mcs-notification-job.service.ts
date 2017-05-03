import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { McsNotification } from '../models/mcs-notification';
import { CoreConfig } from '../core.config';

/**
 * MCS notification job service
 * Serves as the main core of the notification job and it will
 * get notified when there are changes on the websocket (RabbitMQ)
 */
@Injectable()
export class McsNotificationJobService {
  private _websocketClient: any;
  private _websocketSubscription: any;

  /**
   * Subscribe to get the updated notification from websocket(RabbitMQ) in real time
   */
  private _notificationStream: BehaviorSubject<McsNotification>;
  public get notificationStream(): BehaviorSubject<McsNotification> {
    return this._notificationStream;
  }
  public set notificationStream(value: BehaviorSubject<McsNotification>) {
    this._notificationStream = value;
  }

  constructor(private _coreConfig: CoreConfig) {
    this._notificationStream = new BehaviorSubject<McsNotification>(new McsNotification());
    this._initializeWebsocket();
  }

  /**
   * Destroy all instance of websocket and webstomp including subscription
   */
  public destroy() {
    if (this._websocketSubscription) {
      this._websocketSubscription.unsubscribe();
    }
  }

  private _initializeWebsocket() {
    let webStomp = require('webstomp-client');
    let webSocket = new WebSocket(this._coreConfig.notification.host);

    this._websocketClient = webStomp.over(webSocket);
    this._websocketClient.heartbeat.incoming = 0;
    this._websocketClient.heartbeat.outgoing = 0;
    this._websocketClient.connect(
      this._getHeaders(),
      this._onConnect.bind(this)
    );
  }

  private _getHeaders(): any {
    let headers = {
      login: '',
      passcode: ''
    };

    headers.login = this._coreConfig.notification.login ?
      this._coreConfig.notification.login : 'guest';
    headers.passcode = this._coreConfig.notification.passcode ?
      this._coreConfig.notification.passcode : 'guest';
    return headers;
  }

  private _getQueue(): string {
    return '/topic/notifications.jobs.the-quick-brown-123.12345';
  }

  private _onConnect(): void {
    this._websocketSubscription = this._websocketClient
      .subscribe(this._getQueue(), this._onMessage.bind(this));
  }

  private _onMessage(message) {
    if (message.body) {
      this._updateNotification(message.body);
    }
  }

  private _updateNotification(bodyContent: any) {
    if (bodyContent) {
      let updatedNotification: McsNotification;
      updatedNotification = JSON.parse(bodyContent) as McsNotification;
      this._notificationStream.next(updatedNotification);
    }
  }
}
