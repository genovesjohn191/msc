import {
  Component,
  OnInit
} from '@angular/core';
import { filter } from 'rxjs/operators';
import {
  SessionIdleDialogComponent,
  SessionTimeoutDialogComponent
} from './session-dialogs';
import {
  CoreDefinition,
  McsDialogService,
  McsDialogRef,
  McsSessionHandlerService
} from '../../core';
import { isNullOrEmpty } from '../../utilities';

@Component({
  selector: 'mcs-session',
  template: ''
})

export class SessionComponent implements OnInit {
  private _sessionIdleDialogRef: McsDialogRef<any>;

  public constructor(
    private _dialogService: McsDialogService,
    private _sessionHandlerService: McsSessionHandlerService
  ) { }

  public ngOnInit() {
    this._listenToSessionIdle();
    this._listenToSessionResumed();
    this._listenToSessionTimedOut();
  }

  /**
   * Listen to session idle
   */
  private _listenToSessionIdle(): void {
    this._sessionHandlerService.onSessionIdle()
      .pipe(filter((result) => result))
      .subscribe(this._showIdleDialog.bind(this));
  }

  /**
   * Listen to session resumed
   */
  private _listenToSessionResumed(): void {
    this._sessionHandlerService.onSessionResumed()
      .subscribe(this._closeIdleDialog.bind(this));
  }

  /**
   * Listen to session timed out
   */
  private _listenToSessionTimedOut(): void {
    this._sessionHandlerService.onSessionTimedOut()
      .pipe(filter((result) => result))
      .subscribe(this._showTimeOutDialog.bind(this));
  }

  private _showIdleDialog(): void {
    this._sessionIdleDialogRef = this._dialogService.open(SessionIdleDialogComponent, {
      id: 'session-idle-dialog',
      data: CoreDefinition.SESSION_TIMEOUT_COUNTDOWN_IN_SECONDS,
      size: 'medium',
      backdropColor: 'black',
      disableClose: true
    });

    this._sessionIdleDialogRef.afterClosed().subscribe((result) => {
      if (isNullOrEmpty(result)) { return; }
      this._sessionHandlerService.resetTimer();
    });
  }

  private _closeIdleDialog(): void {
    if (isNullOrEmpty(this._sessionIdleDialogRef)) { return; }
    this._sessionIdleDialogRef.close(true);
  }

  private _showTimeOutDialog(): void {
    this._dialogService.open(SessionTimeoutDialogComponent, {
      id: 'session-timedout-dialog',
      size: 'medium',
      backdropColor: 'black',
      disableClose: true
    });
  }
}
