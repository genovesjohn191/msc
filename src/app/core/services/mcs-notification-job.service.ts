import { Injectable } from '@angular/core';
import {
  Subject,
  BehaviorSubject
} from 'rxjs';
import {
  StompRService,
  StompConfig,
  StompState
} from '@stomp/ng2-stompjs';
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
import { StompHeaders } from '@stomp/stompjs';
import { takeUntil } from 'rxjs/operators';

const DEFAULT_HEARTBEAT_IN = 10000;
const DEFAULT_HEARTBEAT_OUT = 10000;

/**
 * MCS notification job service
 * Serves as the main core of the notification job and it will
 * get notified when there are changes on the websocket (RabbitMQ)
 */
@Injectable()
export class McsNotificationJobService implements McsInitializer {
  public notificationStream = new BehaviorSubject<McsApiJob>(new McsApiJob());
  public connectionStatusStream = new Subject<McsConnectionStatus>();

  private _apiSubscription: any;
  private _jobConnection: McsApiJobConnection;
  private _stompState: StompState;
  private _destroySubject = new Subject<void>();

  /**
   * Returns the connection status of websocket
   */
  private _connectionStatus: McsConnectionStatus;
  public set connectionStatus(value: McsConnectionStatus) {
    if (this._connectionStatus !== value) {
      this._connectionStatus = value;
      this.connectionStatusStream.next(this._connectionStatus);
    }
  }

  constructor(
    private _apiService: McsApiService,
    private _loggerService: McsLoggerService,
    private _stompService: StompRService
  ) { }

  /**
   * Initializes the websocket instance and connect
   */
  public initialize(): void {
    this._connectStomp();
  }

  /**
   * Destroy all instance of websocket and webstomp including subscription
   */
  public destroy() {
    unsubscribeSafely(this._apiSubscription);
    unsubscribeSubject(this.connectionStatusStream);
    unsubscribeSubject(this.notificationStream);
    unsubscribeSubject(this._destroySubject);
    this._disconnectStomp();
  }

  /**
   * Retry the connection of webstomp by getting fresh data from API
   */
  public reConnectWebstomp(): void {
    this.connectionStatus = McsConnectionStatus.Reconnecting;
    this._connectStomp();
  }

  /**
   * Gets the connection details from API and connect to web stomp
   */
  private _connectStomp(): void {
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
        this._initializeWebstomp();
        this._listentToErrorState();
      });
  }

  /**
   * Initializes websocket client (webstomp)
   */
  private _initializeWebstomp(): void {
    // Set-up the websocket configuration and connection
    this._stompService.config = {
      url: this._jobConnection.host,
      headers: this._getHeaders(),
      debug: false,
      heartbeat_in: DEFAULT_HEARTBEAT_IN,
      heartbeat_out: DEFAULT_HEARTBEAT_OUT,
      reconnect_delay: CoreDefinition.NOTIFICATION_CONNECTION_RETRY_INTERVAL
    } as StompConfig;
    this._stompService.initAndConnect();

    // Register listener to message of webstomp
    this._stompService.connectObservable
      .subscribe(this._onStompConnected.bind(this));
  }

  /**
   * Event that emits when the stomp is connected
   */
  private _onStompConnected(): void {
    this._loggerService.trace(`Web stomp connected.`);
    let stompMessageSuject = this._stompService.subscribe(this._jobConnection.destinationRoute);
    stompMessageSuject
      .pipe(takeUntil(this._destroySubject))
      .subscribe(this._onStompMessage.bind(this));
    this.connectionStatus = McsConnectionStatus.Success;
  }

  /**
   * Event that emits when stomp received message
   * @param message Message to be emiited
   */
  private _onStompMessage(message) {
    this._loggerService.trace(`Rabbitmq Message Received`, message);
    if (message.body) { this._updateNotification(message.body); }
  }

  /**
   * Event that emits when stomp has error in connecting to rabbitMQ
   */
  private _onStompError(_state: any): void {
    this._loggerService.trace(`Web stomp error.`);
    this.connectionStatus = McsConnectionStatus.Failed;
  }

  /**
   * Returns the headers of the socket including the login and passcode
   */
  private _getHeaders(): StompHeaders {
    let headers = { login: '', passcode: '' };
    let credentials = this._decodeString(this._jobConnection.destinationKey);
    headers.login = credentials.username;
    headers.passcode = credentials.password;
    return headers;
  }

  /**
   * Releases the socket listeners
   */
  private _disconnectStomp(): void {
    let stompConnected = this._stompState === StompState.CONNECTED;
    if (!stompConnected) { return; }
    this._stompService.disconnect();
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
   * Listens to error state of the webstomp
   */
  private _listentToErrorState(): void {
    this._stompService.errorSubject
      .pipe(takeUntil(this._destroySubject))
      .subscribe(this._onStompError.bind(this));
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
