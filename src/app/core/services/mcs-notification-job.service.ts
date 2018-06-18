import { Injectable } from '@angular/core';
import {
  Subject,
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  takeUntil,
  startWith
} from 'rxjs/operators';
import { CoreDefinition } from '../core.definition';
import {
  unsubscribeSafely,
  deserializeJsonToObject,
  isNullOrEmpty,
  unsubscribeSubject
} from '../../utilities';
import { McsApiJob } from '../models/response/mcs-api-job';
import { McsInitializer } from '../interfaces/mcs-initializer.interface';
import { McsConnectionStatus } from '../enumerations/mcs-connection-status.enum';
import { McsApiService } from './mcs-api.service';
import { McsLoggerService } from './mcs-logger.service';
import { McsApiRequestParameter } from '../models/request/mcs-api-request-parameter';
import { McsApiJobConnection } from '../models/response/mcs-api-job-connection';
import { McsApiSuccessResponse } from '../models/response/mcs-api-success-response';

/**
 * MCS notification job service
 * Serves as the main core of the notification job and it will
 * get notified when there are changes on the websocket (RabbitMQ)
 */
@Injectable()
export class McsNotificationJobService implements McsInitializer {
  public notificationStream = new BehaviorSubject<McsApiJob>(new McsApiJob());
  public connectionStatusStream = new Subject<McsConnectionStatus>();

  private _websocket: WebSocket;
  private _websocketClient: any;
  private _apiSubscription: any;
  private _jobConnection: McsApiJobConnection;
  private _destroyTimer: Subject<void>;
  private _connectionCounter = Observable.interval(1000);

  /**
   * Returns the connection status of websocket
   */
  private _connectionStatus: McsConnectionStatus;
  public set connectionStatus(value: McsConnectionStatus) {
    if (this._connectionStatus !== value) {
      this._connectionStatus = value;
      this.connectionStatusStream.next(this._connectionStatus);

      // We need to destroy the timer subject to stop the counter immediately
      // when error occurs in the connection
      let connectionError = value < 0;
      if (connectionError) { unsubscribeSubject(this._destroyTimer); }
    }
  }

  constructor(
    private _apiService: McsApiService,
    private _loggerService: McsLoggerService
  ) { }

  /**
   * Initializes the websocket instance and connect
   */
  public initialize(): void {
    this._connectWebsocket();
  }

  /**
   * Destroy all instance of websocket and webstomp including subscription
   */
  public destroy() {
    unsubscribeSafely(this._websocketClient);
    unsubscribeSafely(this._apiSubscription);
    unsubscribeSubject(this._destroyTimer);
  }

  /**
   * Retry the connection of websocket by getting the data from API and connect to websocket
   */
  public reConnectWebsocket(): void {
    this.connectionStatus = McsConnectionStatus.Reconnecting;
    this._connectWebsocket();
  }

  /**
   * Gets the connection details from API and connect to websocket
   */
  private _connectWebsocket(): void {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/jobs/connection';

    this._apiSubscription = this._apiService.get(mcsApiRequestParameter)
      .finally(() => {
        this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
      })
      .map((response) => {
        // Deserialize json reponse
        let apiResponse = McsApiSuccessResponse
          .deserializeResponse<McsApiJobConnection>(McsApiJobConnection, response);

        this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
        this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
        this._loggerService.traceInfo(`converted response:`, apiResponse);
        return apiResponse;
      })
      .subscribe((details) => {
        if (isNullOrEmpty(details)) {
          this._loggerService.traceEnd(`No connection details data found.`);
          this.connectionStatus = McsConnectionStatus.NoData;
          return;
        }

        this._jobConnection = details.content;
        this.connectionStatus = McsConnectionStatus.Connecting;
        this._initializeWebsocket();
      });
  }

  /**
   * Initializes the websocket instance and connect based on connection details
   */
  private _initializeWebsocket() {
    let webStomp = require('webstomp-client');
    this._websocket = new WebSocket(this._jobConnection.host);
    this._websocket.onopen = this._onWebsocketOpened.bind(this);
    this._websocket.onerror = this._onWebsocketError.bind(this);

    // Setup websocket client and connect
    this._websocketClient = null;
    this._websocketClient = webStomp.over(this._websocket, { debug: false });
    this._websocketClient.connect(
      this._getHeaders(),
      this._onStompConnect.bind(this),
      this._onStompError.bind(this));
  }

  /**
   * Event that emits when error occured while connecting to websocket
   */
  private _onWebsocketError() {
    this._loggerService.trace(`Websocket connection error. Closing the websocket.`);
    this.connectionStatus = McsConnectionStatus.Fatal;
  }

  /**
   * Event that emits when websocket is opened
   */
  private _onWebsocketOpened() {
    this._loggerService.trace(`Websocket connection opened.`);
    this.connectionStatus = McsConnectionStatus.Success;
  }

  /**
   * Returns the headers of the socket including the login and passcode
   */
  private _getHeaders(): any {
    let headers = { login: '', passcode: '' };
    let credentials = this._decodeString(this._jobConnection.destinationKey);
    headers.login = credentials.username;
    headers.passcode = credentials.password;
    return headers;
  }

  /**
   * Event that emits when stomp gets connected
   */
  private _onStompConnect(): void {
    this._loggerService.trace(`Web stomp connected.`);
    unsubscribeSubject(this._destroyTimer);
    this._destroyTimer = new Subject<void>();

    // Execute async process while the socket is connecting
    this._connectionCounter
      .pipe(startWith(0), takeUntil(this._destroyTimer))
      .subscribe(() => {

        switch (this._websocketClient.ws.readyState) {
          case WebSocket.OPEN:
            this.connectionStatus = McsConnectionStatus.Success;
            this._websocketClient.subscribe(
              this._jobConnection.destinationRoute,
              this._onStompMessage.bind(this));
          case WebSocket.CLOSED:
          case WebSocket.CLOSING:
            unsubscribeSubject(this._destroyTimer);
            break;
        }
        this._loggerService.trace(`Web socket connected.`);
      });
  }

  /**
   * Event that emits when stomp has error in connecting to rabbitMQ
   */
  private _onStompError(): void {
    this._loggerService.trace(`Web stomp error.`);
    this.connectionStatus = McsConnectionStatus.Failed;
    if (this._websocket.CONNECTING) { return; }

    // Retry the connection every 10 seconds
    setTimeout(() => this._initializeWebsocket(),
      CoreDefinition.NOTIFICATION_CONNECTION_RETRY_INTERVAL);
  }

  /**
   * Event that emits when stomp received message
   * @param message Message to be emiited
   */
  private _onStompMessage(message) {
    this._loggerService.trace(`Rabbitmq Message Received`, message);
    if (message.body) {
      this._updateNotification(message.body);
    }
  }

  /**
   * Notify the notification subscribers that a job is emitted
   * @param bodyContent Emitted job to be sent
   */
  private _updateNotification(bodyContent: any) {
    if (isNullOrEmpty(bodyContent)) { return; }
    let updatedNotification: McsApiJob;
    updatedNotification = deserializeJsonToObject(McsApiJob, JSON.parse(bodyContent));
    this.notificationStream.next(updatedNotification);
  }

  /**
   * Decodes the hexadecimal content to get the credentials
   * @param hexInput Hexdecimal input to be decoded
   */
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
