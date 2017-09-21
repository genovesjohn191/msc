import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { McsApiJob } from '../models/response/mcs-api-job';
import { CoreDefinition } from '../core.definition';
import {
  reviverParser,
  refreshView
} from '../../utilities';
import { McsConnectionStatus } from '../enumerations/mcs-connection-status.enum';
import { McsApiService } from './mcs-api.service';
import { McsApiRequestParameter } from '../models/request/mcs-api-request-parameter';
import { McsApiJobConnection } from '../models/response/mcs-api-job-connection';
import { McsApiSuccessResponse } from '../models/response/mcs-api-success-response';

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
  private _notificationStream: BehaviorSubject<McsApiJob>;
  public get notificationStream(): BehaviorSubject<McsApiJob> {
    return this._notificationStream;
  }
  public set notificationStream(value: BehaviorSubject<McsApiJob>) {
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

  private _jobConnectStream: BehaviorSubject<McsApiJobConnection>;
  private _apiSubscription: any;
  private _jobConnection: McsApiJobConnection;

  constructor(private _apiService: McsApiService) {
    this._jobConnectStream = new BehaviorSubject<McsApiJobConnection>(undefined);
    this._notificationStream = new BehaviorSubject<McsApiJob>(new McsApiJob());
    this._connectionStatusStream = new BehaviorSubject<McsConnectionStatus>
      (McsConnectionStatus.Success);

    // Initialize websocket to connect with the real time update of notifications
    this._initializeWebsocket();
  }

  /**
   * Destroy all instance of websocket and webstomp including subscription
   */
  public destroy() {
    if (this._websocketClient) {
      this._websocketClient.unsubscribe();
    }
    if (this._apiSubscription) {
      this._apiSubscription.unsubscribe();
    }
  }

  private _initializeWebsocket() {
    try {
      // Listen for job connection to get the identity details
      this._jobConnectStream.subscribe((jobConnection) => {
        if (jobConnection) {
          this._jobConnection = jobConnection;

          // Register all listeners for websocket to determine the connection status
          this._websocket = new WebSocket(this._jobConnection.host);
          this._websocket.onopen = this._onOpenConnection.bind(this);
          this._websocket.onerror = this._onErrorConnection.bind(this);
          this._websocket.onclose = this._onCloseConnection.bind(this);

          // Connect to websocket
          this._connectToWebsocket();
        }
      });

      // Get Connection details from API
      this._getConnectionsDetails();

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
    refreshView(() => {
      this._initializeWebsocket();
      this._connectionStatusStream.next(McsConnectionStatus.Retrying);
    }, CoreDefinition.NOTIFICATION_CONNECTION_RETRY_INTERVAL);
  }

  private _onOpenConnection() {
    this._connectionStatusStream.next(McsConnectionStatus.Success);
  }

  private _connectToWebsocket() {
    let webStomp = require('webstomp-client');

    // Setup websocker client
    this._websocketClient = webStomp.over(this._websocket, { debug: false });

    this._websocketClient.connect(
      this._getHeaders(),
      this._onConnect.bind(this)
    );
  }

  private _getHeaders(): any {
    let headers = { login: '', passcode: ''};
    let credentials = this._decodeString(this._jobConnection.destinationKey);
    headers.login = credentials.username;
    headers.passcode = credentials.password;
    return headers;
  }

  private _onConnect(): void {
    this._websocketClient.subscribe(this._jobConnection.destinationRoute,
      this._onMessage.bind(this));
  }

  private _onMessage(message) {
    if (message.body) {
      this._updateNotification(message.body);
    }
  }

  private _updateNotification(bodyContent: any) {
    if (bodyContent) {
      let updatedNotification: McsApiJob;
      updatedNotification = JSON.parse(bodyContent, reviverParser) as McsApiJob;
      this._notificationStream.next(updatedNotification);
    }
  }

  private _getConnectionsDetails(): void {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/jobs/connection';

    this._apiSubscription = this._apiService.get(mcsApiRequestParameter)
      .map((response) => {
        let jobConnection: McsApiSuccessResponse<McsApiJobConnection>;
        jobConnection = JSON.parse(response.text(),
          reviverParser) as McsApiSuccessResponse<McsApiJobConnection>;

        return jobConnection;
      })
      .subscribe((details) => {
        this._jobConnectStream.next(details.content);
      });
  }

  private _decodeString(hexInput: string): { username: string, password: string } {
    let decodedHex: string = '';
    let credentials: string[];
    let hexvalue = hexInput.match(/.{1,2}/g) || [];

    // Decode hexadecimal
    hexvalue.forEach((hex) => {
      decodedHex += String.fromCharCode(parseInt(hex, 16));
    });

    // Split decoded value
    credentials = decodedHex.split('.');
    return { username: credentials[0], password: credentials[1] };
  }
}
