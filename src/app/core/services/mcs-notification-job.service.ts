import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { McsNotification } from '../models/mcs-notification';
import { CoreConfig } from '../core.config';
import { CoreDefinition } from '../core.definition';
import { AppState } from '../../app.service';
import { reviverParser } from '../functions/mcs-json.function';
import { McsConnectionStatus } from '../enumerations/mcs-connection-status.enum';

/**
 * MCS notification job service
 * Serves as the main core of the notification job and it will
 * get notified when there are changes on the websocket (RabbitMQ)
 */
@Injectable()
export class McsNotificationJobService {
  private _websocket: WebSocket;
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

  /**
   * Subsrcibe to know the connection status in real time
   */
  private _connectionStatusStream: BehaviorSubject<McsConnectionStatus>;
  public get connectionStatusStream(): BehaviorSubject<McsConnectionStatus> {
    return this._connectionStatusStream;
  }
  public set connectionStatusStream(value: BehaviorSubject<McsConnectionStatus>) {
    this._connectionStatusStream = value;
  }

  constructor(
    private _coreConfig: CoreConfig,
    private _appState: AppState
  ) {
    this._notificationStream = new BehaviorSubject<McsNotification>(new McsNotification());
    this._connectionStatusStream = new BehaviorSubject<McsConnectionStatus>
      (McsConnectionStatus.Success);
    this._initializeWebsocket();
  }

  /**
   * Destroy all instance of websocket and webstomp including subscription
   */
  public destroy() {
    if (this._websocketClient) {
      this._websocketClient.unsubscribe();
    }
  }

  private _initializeWebsocket() {
    try {
      this._websocket = new WebSocket(this._coreConfig.notification.host);

      // Register all listeners for websocket to determine the connection status
      this._websocket.onopen = this._onOpenConnection.bind(this);
      this._websocket.onerror = this._onErrorConnection.bind(this);
      this._websocket.onclose = this._onCloseConnection.bind(this);

      // Connect to websocket
      this._connectToWebsocket();
    } catch (error) {
      // notify all subscribers for the error occured
      this._connectionStatusStream.next(McsConnectionStatus.Fatal);
    }
  }

  private _onErrorConnection() {
    this._connectionStatusStream.next(McsConnectionStatus.Failed);
    this._websocket.close();
  }

  private _onCloseConnection(event) {
    setTimeout(() => {
      this._initializeWebsocket();
      this._connectionStatusStream.next(McsConnectionStatus.Retrying);
    }, CoreDefinition.NOTIFICATION_CONNECTION_RETRY_INTERVAL);
  }

  private _onOpenConnection() {
    this._connectionStatusStream.next(McsConnectionStatus.Success);
  }

  private _connectToWebsocket() {
    let webStomp = require('webstomp-client');

    this._websocketClient = webStomp.over(this._websocket);
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

    headers.login = this._coreConfig.notification.user ?
      this._coreConfig.notification.user : 'guest';
    headers.passcode = this._coreConfig.notification.password ?
      this._coreConfig.notification.password : 'guest';
    return headers;
  }

  private _getQueue(): string {
    let queueString: string;
    let accountId: string;

    accountId = this._appState.get(CoreDefinition.APPSTATE_ACCOUNT_ID);

    // Create queue string based on the route prefix of the notification
    if (this._coreConfig.notification.routePrefix) {
      queueString = `${this._coreConfig.notification.routePrefix}.job.${accountId}`;
    } else {
      queueString = `job.${accountId}`;
    }
    return queueString;
  }

  private _onConnect(): void {
    this._websocketClient.subscribe(this._getQueue(), this._onMessage.bind(this));
  }

  private _onMessage(message) {
    if (message.body) {
      this._updateNotification(message.body);
    }
  }

  private _updateNotification(bodyContent: any) {
    if (bodyContent) {
      let updatedNotification: McsNotification;
      updatedNotification = JSON.parse(bodyContent, reviverParser) as McsNotification;
      this._notificationStream.next(updatedNotification);
    }
  }
}
