import { Injectable } from '@angular/core';
import {
  Observable,
  Subject,
  fromEvent,
  merge,
  interval
} from 'rxjs';
import {
  takeUntil,
  filter,
  distinctUntilChanged
} from 'rxjs/operators';
import { McsInitializer } from '../interfaces/mcs-initializer.interface';
import { McsCookieService } from './mcs-cookie.service';
import { McsAuthenticationIdentity } from '../authentication/mcs-authentication.identity';
import { McsAuthenticationService } from '../authentication/mcs-authentication.service';
import {
  isNullOrEmpty,
  unsubscribeSubject,
  coerceNumber
} from '../../utilities';
import { CoreDefinition } from '../core.definition';
import { McsGuid } from '../factory/guid/mcs-guid';

@Injectable()
export class McsSessionHandlerService implements McsInitializer {
  private _sessionIdleCounter: number = 0;
  private _sessionIsIdle: boolean = false;

  // Events subject
  private _onSessionIdle = new Subject<boolean>();
  private _onSessionTimedOut = new Subject<boolean>();
  private _onSessionResumed = new Subject<boolean>();
  private _destroySubject = new Subject<void>();

  /**
   * Returns the session cookie value
   */
  public get sessionCookie(): number {
    return coerceNumber(this._cookieService.getItem(CoreDefinition.COOKIE_SESSION_TIMER));
  }

  /**
   * Returns true if the current auth token has already timed out
   */
  public get authTokenHasTimedOut(): boolean {
    let sessionTimedOutToken = this._cookieService
      .getItem(CoreDefinition.COOKIE_SESSION_ID);
    return !isNullOrEmpty(sessionTimedOutToken);
  }

  /**
   * Returns true if session is idle
   */
  public get sessionIsIdle(): boolean {
    return (this.sessionCookie >= CoreDefinition.SESSION_IDLE_TIME_IN_SECONDS)
      && (this._sessionIdleCounter >= CoreDefinition.SESSION_IDLE_TIME_IN_SECONDS)
      && !this.authTokenHasTimedOut;
  }

  /**
   * Returns true if session has timed out
   */
  public get sessionTimedOut(): boolean {
    let idleLimitInSeconds = CoreDefinition.SESSION_IDLE_TIME_IN_SECONDS
      + CoreDefinition.SESSION_TIMEOUT_COUNTDOWN_IN_SECONDS;
    return (this.sessionCookie >= idleLimitInSeconds
      && this._sessionIdleCounter >= idleLimitInSeconds)
      || this.authTokenHasTimedOut;
  }

  /**
   * Returns true if session was resumed
   */
  public get sessionResumed(): boolean {
    return (this.sessionCookie < CoreDefinition.SESSION_IDLE_TIME_IN_SECONDS)
      && (this.sessionCookie < this._sessionIdleCounter);
  }

  constructor(
    private _cookieService: McsCookieService,
    private _authIdentity: McsAuthenticationIdentity,
    private _authService: McsAuthenticationService
  ) { }

  /**
   * Initialize the session handler
   */
  public initialize(): void {
    this._registerActivityEvents();
    this._registerRealTimeListener();
  }

  /**
   * Unsubscribe session idle subscription
   */
  public destroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Reset idle timer
   */
  public resetTimer(): void {
    this._sessionIdleCounter = 0;
    this._sessionIsIdle = false;
    this._onSessionIdle.next(false);
    this._onSessionTimedOut.next(false);
  }

  /**
   * Observable that triggers when session was resumed
   */
  public onSessionResumed(): Observable<boolean> {
    return this._onSessionResumed.pipe(distinctUntilChanged());
  }

  /**
   * Observable that triggers when session is idle
   */
  public onSessionIdle(): Observable<boolean> {
    return this._onSessionIdle.pipe(distinctUntilChanged());
  }

  /**
   * Observable that triggers when session has timed out
   */
  public onSessionTimedOut(): Observable<boolean> {
    return this._onSessionTimedOut;
  }

  public renewSession(): void {
    this._cookieService.removeItem(CoreDefinition.COOKIE_SESSION_ID);
    this._authService.logOut();
  }

  /**
   * Register activity events
   */
  private _registerActivityEvents(): void {
    merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'resize'),
      fromEvent(document, 'keydown')
    )
      .pipe(
        takeUntil(this._destroySubject),
        filter(() => !this._sessionIsIdle)
      )
      .subscribe((_events: any) => {
        if (isNullOrEmpty(_events)) { return; }
        this.resetTimer();
      });
  }

  /**
   * Register real time listener
   */
  private _registerRealTimeListener(): void {
    interval(1000)
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        this._sessionIdleCounter = Math.min(this._sessionIdleCounter, this.sessionCookie);
        this._sessionIdleCounter++;
        this._checkSessionStatus();
      });
  }

  /**
   * Real time checkin of session status
   */
  private _checkSessionStatus(): void {
    // Check resumed
    if (this.sessionResumed) {
      this._sessionIsIdle = false;
      this._onSessionResumed.next(true);
    }

    // Check idle timer
    if (this.sessionIsIdle) {
      this._sessionIsIdle = true;
      this._onSessionResumed.next(false);
      this._onSessionIdle.next(true);
    }

    // Check session timed out
    if (this.sessionTimedOut) {
      this._cookieService.setItem(CoreDefinition.COOKIE_SESSION_ID,
        McsGuid.newGuid().toString(), { expires: this._authIdentity.user.expiry });

      this._onSessionTimedOut.next(true);
    }

    // Set the cookie service
    if (this._sessionIdleCounter >= 1) {
      this._cookieService.setItem(CoreDefinition.COOKIE_SESSION_TIMER,
        this._sessionIdleCounter, { expires: this._authIdentity.user.expiry });
    }
  }
}
