import {
  Injectable,
  isDevMode
} from '@angular/core';
import {
  Observable,
  Subject,
  fromEvent,
  merge,
  interval,
  timer
} from 'rxjs';
import {
  takeUntil,
  filter,
  distinctUntilChanged
} from 'rxjs/operators';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  coerceNumber,
  resolveEnvVar,
  McsEnvironmentVariables,
  CommonDefinition
} from '@app/utilities';
import { McsIdentity } from '@app/models';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';
import { LogMethod } from '@peerlancers/ngx-logger';

import { McsAuthenticationIdentity } from '../authentication/mcs-authentication.identity';
import { McsAuthenticationService } from '../authentication/mcs-authentication.service';
import { McsCookieService } from './mcs-cookie.service';

@Injectable()
export class McsSessionHandlerService {
  private _sessionIdleCounter: number = 0;
  private _sessionIsIdle: boolean = false;
  private _previousTargetCompanyId: string;

  // Events subject
  private _onTargetCompanyChanged = new Subject<boolean>();
  private _onCurrentUserChanged = new Subject<boolean>();
  private _onSessionIdle = new Subject<boolean>();
  private _onSessionTimeOut = new Subject<boolean>();
  private _onSessionActivated = new Subject<boolean>();
  private _onRequestSessionExtension = new Subject<void>();
  private _destroySubject = new Subject<void>();
  private _timerSubject = new Subject<void>();

  /**
   * Amount of time in seconds the user is considered idle
   */
  public get idleTimeInSeconds(): number {
    let cookieSessionIdleTime =
      coerceNumber(this._cookieService.getItem(CommonDefinition.COOKIE_SESSION_TIMER));
    return Math.min(cookieSessionIdleTime, this._sessionIdleCounter);
  }

  /**
   * Returns true if session is currently idle
   */
  public get sessionIsIdle(): boolean {
    return !isDevMode()
      && (this.idleTimeInSeconds >= CommonDefinition.SESSION_IDLE_TIME_IN_SECONDS
        || this._sessionIsIdle);
  }

  /**
   * Returns true is session has timedout
   */
  public get sessionTimedOut(): boolean {
    let maxIAllowedIdleTimeInSeconds = CommonDefinition.SESSION_IDLE_TIME_IN_SECONDS
      + CommonDefinition.SESSION_TIMEOUT_COUNTDOWN_IN_SECONDS;
    let hasTimedOutIndicatiorCookie =
      !isNullOrEmpty(this._cookieService.getItem(CommonDefinition.COOKIE_SESSION_ID));

    return !isDevMode()
      && (this.idleTimeInSeconds >= maxIAllowedIdleTimeInSeconds
        || hasTimedOutIndicatiorCookie);
  }

  public get sessionActive(): boolean {
    return (this.idleTimeInSeconds < CommonDefinition.SESSION_IDLE_TIME_IN_SECONDS);
  }

  public get userChanged(): boolean {
    let userId = this._authIdentity.user.hashedId;
    let stateId = this._cookieService.getItem(CommonDefinition.COOKIE_USER_STATE_ID);
    return userId !== stateId;
  }

  public get targetCompanyChanged(): boolean {
    let cookieTargetCompanyId: string =
      this._cookieService.getEncryptedItem(CommonDefinition.COOKIE_ACTIVE_ACCOUNT);
    let targetCompanyHasChanged = this._previousTargetCompanyId !== cookieTargetCompanyId;
    this._previousTargetCompanyId = cookieTargetCompanyId;

    return targetCompanyHasChanged;
  }

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _cookieService: McsCookieService,
    private _authIdentity: McsAuthenticationIdentity,
    private _authService: McsAuthenticationService
  ) {
    this._eventDispatcher.addEventListener(
      McsEvent.userChange, this._onUserChanged.bind(this));
  }

  /**
   * Stops all sessions
   */
  public stopSessions(): void {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._timerSubject);
  }

  /**
   * Resets idle counter and resumes the session
   */
  public resumeSessions(): void {
    this._sessionIdleCounter = 0;
    this._sessionIsIdle = false;
    this._onSessionIdle.next(false);
    this._onSessionTimeOut.next(false);
    this._onSessionActivated.next(true);
    this._onCurrentUserChanged.next(this.userChanged);
    this._onTargetCompanyChanged.next(this.targetCompanyChanged);
  }

  /**
   * Triggers when user changed
   */
  public onCurrentUserChanged(): Observable<boolean> {
    return this._onCurrentUserChanged
      .pipe(distinctUntilChanged(), filter((response) => response));
  }

  /**
   * Triggers when target company changed
   */
  public onTargetCompanyChanged(): Observable<boolean> {
    return this._onTargetCompanyChanged
      .pipe(distinctUntilChanged(), filter((response) => response));
  }

  /**
   * Triggers when session is activated
   */
  public onSessionActivated(): Observable<boolean> {
    return this._onSessionActivated
      .pipe(distinctUntilChanged(), filter((response) => response));
  }

  /**
   * Triggers when session is idle
   */
  public onSessionIdle(): Observable<boolean> {
    return this._onSessionIdle
      .pipe(distinctUntilChanged(), filter((response) => response));
  }

  /**
   * Triggers when session has timed out
   * @deprecated Use the event bus instead
   */
  public onSessionTimeOut(): Observable<boolean> {
    return this._onSessionTimeOut
      .pipe(distinctUntilChanged(), filter((response) => response));
  }

  /**
   * Triggers when session is requesting for extension
   */
  public onRequestSessionExtension(): Observable<void> {
    return this._onRequestSessionExtension;
  }

  /**
   * Resets session monitoring state and logs out the user
   */
  public renewSession(): void {
    this._cookieService.removeItem(CommonDefinition.COOKIE_SESSION_ID);
    this._authService.logOut();
  }

  /**
   * Register all the events that constitutes to an active session here
   */
  private _registerActivityEvents(): void {
    merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'resize'),
      fromEvent(document, 'keydown')
    )
      .pipe(
        takeUntil(this._destroySubject),
        filter(() => !this.sessionIsIdle)
      )
      .subscribe((_events: any) => {
        if (isNullOrEmpty(_events)) { return; }

        this.resumeSessions();
      });
  }

  /**
   * Setup a timer that monitors user activity changes
   */
  private _initializeSessionStatusObserver(): void {
    interval(1000)
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        this._updateSessionIdleCounter();
        this._triggerEvents();
      });
  }

  /**
   * Event that emits when the user has been changed
   * @param user Changed user/identity
   */
  private _onUserChanged(user: McsIdentity): void {
    if (isNullOrEmpty(user)) { return; }
    this._setUserValidation(user);

    // Get current target company to be used for company switch detection
    this._previousTargetCompanyId =
      this._cookieService.getEncryptedItem(CommonDefinition.COOKIE_ACTIVE_ACCOUNT);

    this._registerActivityEvents();
    this._initializeSessionStatusObserver();
    this._registerEventHandlers();

    this._onSessionActivated.next(true);
  }

  /**
   * Registers all the event handlers
   */
  @LogMethod()
  private _registerEventHandlers() {

    this.onCurrentUserChanged()
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        location.reload();
      });

    this.onTargetCompanyChanged()
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        location.reload();
      });

    this.onSessionIdle()
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._sessionIdleEventHandler());

    this.onSessionActivated()
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._sessionActivedEventHandler());
  }

  /**
   * Validates the user and remove it from the cookie when the user has been changed
   */
  @LogMethod()
  private _setUserValidation(identity: McsIdentity) {
    let sessionId = identity.hashedId + identity.expiry;
    let hashedId = this._cookieService.getEncryptedItem(CommonDefinition.COOKIE_SESSION_ID);
    if (sessionId !== hashedId) {
      this._cookieService.removeItem(CommonDefinition.COOKIE_SESSION_ID);
    }
  }

  private _sessionIdleEventHandler() {
    this._stopSessionExtensionRequestCountdown();
    this._onSessionActivated.next(false);
  }

  private _sessionActivedEventHandler() {
    this._setupExtendSessionRequestScheduler();
  }

  /**
   * Updates idle counter and synchronizes with cookie
   */
  private _updateSessionIdleCounter() {
    this._sessionIdleCounter = this.idleTimeInSeconds;
    this._sessionIdleCounter++;

    // Update the cookie
    if (this._sessionIdleCounter >= 1) {
      this._cookieService.setItem(CommonDefinition.COOKIE_SESSION_TIMER,
        this._sessionIdleCounter, { expires: this._authIdentity.user.expiry });
    }
  }

  private _triggerEvents(): void {
    // Trigger user changed event
    this._onCurrentUserChanged.next(this.userChanged);

    // Trigger target company changed event
    this._onTargetCompanyChanged.next(this.targetCompanyChanged);

    // Trigger idle event
    this._onSessionIdle.next(this.sessionIsIdle);

    // Trigger activated event
    this._onSessionActivated.next(!this.sessionIsIdle);

    // Trigger timedout event
    if (this.sessionTimedOut) {
      this._eventDispatcher.dispatch(McsEvent.sessionTimedOut);
      this._createSessionId();
    }

    this._onSessionTimeOut.next(this.sessionTimedOut);
  }

  @LogMethod()
  private _setupExtendSessionRequestScheduler() {
    // Get expiry in seconds
    let now = new Date();
    let expiry = new Date(this._authIdentity.user.expiry);
    let expiryInSeconds: any = (expiry.getTime() - now.getTime()) / 1000;

    // Calculate time in seconds before we trigger about to expire event
    let sessionExtensionWindowInSeconds =
      coerceNumber(resolveEnvVar(McsEnvironmentVariables.McsSessionExtensionWindowInSeconds));
    let extensionCounterInSeconds = 1;
    if (expiryInSeconds > sessionExtensionWindowInSeconds) {
      extensionCounterInSeconds = expiryInSeconds - sessionExtensionWindowInSeconds;
    }
    this._initializeSessionExtensionRequestCountdownTimer(extensionCounterInSeconds);
  }

  private _initializeSessionExtensionRequestCountdownTimer(remainingTimeInSeconds: number) {
    timer(remainingTimeInSeconds * 1000)
      .pipe(takeUntil(this._timerSubject))
      .subscribe(() => this._requestSessionExtension());
  }

  private _createSessionId() {
    let sessionId = this._authIdentity.user.hashedId + this._authIdentity.user.expiry;

    this._cookieService.setEncryptedItem(CommonDefinition.COOKIE_SESSION_ID,
      sessionId, { expires: this._authIdentity.user.expiry });
  }

  @LogMethod()
  private _stopSessionExtensionRequestCountdown() {
    this._timerSubject.next();
  }

  @LogMethod()
  private _requestSessionExtension() {
    this._onRequestSessionExtension.next();
    // TODO: We should setup the scheduler again after successful extension
    // Create a listener to identity expiry changes
  }
}
