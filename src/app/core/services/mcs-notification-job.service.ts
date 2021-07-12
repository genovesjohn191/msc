import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  takeUntil,
  tap
} from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsIdentity,
  McsJob,
  McsJobConnection,
  McsPermission,
  NetworkStatus
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  deserializeJsonToObject,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  McsDisposable
} from '@app/utilities';
import {
  LogClass,
  LogIgnore
} from '@peerlancers/ngx-logger';
import {
  StompConfig,
  StompRService,
  StompState
} from '@stomp/ng2-stompjs';
import { StompHeaders } from '@stomp/stompjs';

import { McsAccessControlService } from '../authentication/mcs-access-control.service';
import { McsSessionHandlerService } from './mcs-session-handler.service';

const DEFAULT_HEARTBEAT_IN = 0;
const DEFAULT_HEARTBEAT_OUT = 20000;

/**
 * MCS notification job service
 * Serves as the main core of the notification job and it will
 * get notified when there are changes on the websocket (RabbitMQ)
 */
@Injectable()
@LogClass()
export class McsNotificationJobService implements McsDisposable {
  public notificationStream = new BehaviorSubject<McsJob>(null);
  public connectionStatusStream = new Subject<NetworkStatus>();

  private _apiSubscription: any;
  private _stompInstance: Observable<any>;
  private _stompSubscription: Subscription;
  private _userChangeHandler: Subscription;
  private _jobConnection: McsJobConnection;
  private _destroySubject = new Subject<void>();
  private _initialized: boolean = false;

  /**
   * Returns the connection status of websocket
   */
  private _connectionStatus: NetworkStatus;
  public set connectionStatus(value: NetworkStatus) {
    this._connectionStatus = value;
    this.connectionStatusStream.next(this._connectionStatus);
  }

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _apiService: McsApiService,
    private _sessionHandlerService: McsSessionHandlerService,
    private _accessControlService: McsAccessControlService,
    private _stompService: StompRService
  ) {
    this._registerEvents();
  }

  /**
   * Disposes the instance of job connection from rabbit MQ
   */
  public dispose() {
    unsubscribeSafely(this._stompSubscription);
    unsubscribeSafely(this._apiSubscription);
    unsubscribeSafely(this.connectionStatusStream);
    unsubscribeSafely(this.notificationStream);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._userChangeHandler);
    this._disconnectStomp();
  }

  /**
   * Gets the connection details from API and connect to web stomp
   */
  private _connectStomp(): void {
    this._apiSubscription = this._apiService.getJobConnection().pipe(
      tap((connection) => {
        if (isNullOrEmpty(connection)) {
          this.connectionStatus = NetworkStatus.NoData;
          return;
        }
        this._jobConnection = connection;
        this.connectionStatus = NetworkStatus.Connecting;

        Promise.resolve().then(() => {
          this._initializeWebstomp();
          this._listenToStateChange();
        });
      })
    ).subscribe();
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
      discardWebsocketOnCommFailure: true,
      heartbeat_in: DEFAULT_HEARTBEAT_IN,
      heartbeat_out: DEFAULT_HEARTBEAT_OUT,
      reconnect_delay: CommonDefinition.NOTIFICATION_CONNECTION_RETRY_INTERVAL
    } as StompConfig;

    try {
      this._stompService.initAndConnect();
    } catch {
      this._stompService.connectionState$.subscribe((value) => {
        if (value === 3 && !this._initialized) {
          this._initialized = true;
          this._stompService.initAndConnect();
        }
      })
    }
  }

  /**
   * Event that emits when the stomp is connected
   */
  private _onStompConnected(): void {
    try {
      unsubscribeSafely(this._stompSubscription);
      this._stompInstance = this._stompService
        .subscribe(this._jobConnection.destinationRoute);

      this._stompSubscription = this._stompInstance
        .subscribe(this._onStompMessage.bind(this));
      this.connectionStatus = NetworkStatus.Success;
    } catch (_error) {
      // Do something
    }
  }

  /**
   * Event that emits when stomp has error in connecting to rabbitMQ
   */
  private _onStompError(): void {
    this.connectionStatus = NetworkStatus.Failed;
  }

  /**
   * Event that emits when stomp received message
   * @param message Message to be emiited
   */
  @LogIgnore()
  private _onStompMessage(message) {
    if (!this._sessionHandlerService.sessionActive ||
      isNullOrEmpty(message.body)) { return; }
    this._updateNotification(message.body);
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
    try {
      if (!this._stompService.connected()) { return; }
      this._stompService.disconnect();
    } catch (error) {
      this._disconnectStomp();
    }
  }

  /**
   * Notify the notification subscribers that a job is emitted
   * @param bodyContent Emitted job to be sent
   */
  private _updateNotification(bodyContent: any) {
    if (isNullOrEmpty(bodyContent)) { return; }
    let updatedNotification: McsJob;
    updatedNotification = deserializeJsonToObject(McsJob, JSON.parse(bodyContent));
    this.notificationStream.next(updatedNotification);
  }

  /**
   * Listens to connection state change
   */
  private _listenToStateChange(): void {
    this._stompService.state
      .pipe(takeUntil(this._destroySubject))
      .subscribe((state) => {
        switch (state) {
          case StompState.CONNECTED:
            this._onStompConnected();
            break;

          case StompState.CLOSED:
          case StompState.DISCONNECTING:
            this._onStompError();
            unsubscribeSafely(this._stompSubscription);
            break;

          case StompState.TRYING:
          default:
            unsubscribeSafely(this._stompSubscription);
            break;
        }
      });
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

  /**
   * Register event listeners to event-bus
   */
  private _registerEvents(): void {
    this._userChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.userChange, this._onUserChanged.bind(this));
  }

  /**
   * Event that gets emitted when the user has been changed
   */
  private _onUserChanged(user: McsIdentity): void {
    if (isNullOrEmpty(user)) { return; }
    // Prevent the stomp from connecting when the session is already timedout
    let sessionTimedOut = this._sessionHandlerService.sessionTimedOut;
    if (sessionTimedOut) { return; }
    this._connectStomp();
  }
}
