import {
  Component,
  OnInit
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  filter,
  tap
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsSessionHandlerService
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  DialogService,
  DialogMessageConfig,
  DialogRef
} from '@app/shared';
import { SessionIdleDialogComponent } from './session-dialogs';

@Component({
  selector: 'mcs-session',
  template: ''
})

export class SessionComponent implements OnInit {
  private _sessionIdleDialogRef: DialogRef<any>;

  public constructor(
    private _translateService: TranslateService,
    private _dialogService: DialogService,
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
    this._sessionHandlerService.onSessionActivated()
      .subscribe(this._closeIdleDialog.bind(this));
  }

  /**
   * Listen to session timed out
   */
  private _listenToSessionTimedOut(): void {
    this._sessionHandlerService.onSessionTimeOut()
      .pipe(filter((result) => result))
      .subscribe(this._showTimeOutDialog.bind(this));
  }

  /**
   * Shows the idle dialog
   */
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
      this._sessionHandlerService.resumeSessions();
    });
  }

  /**
   * Closes the idle dialog
   */
  private _closeIdleDialog(): void {
    if (isNullOrEmpty(this._sessionIdleDialogRef)) { return; }
    this._sessionIdleDialogRef.close(true);
  }

  /**
   * Shows the timedout dialog
   */
  private _showTimeOutDialog(): void {
    let dialogData = {
      title: this._translateService.instant(`dialogSessionTimedOut.title`),
      message: this._translateService.instant(`dialogSessionTimedOut.message`),
      okText: this._translateService.instant(`dialogSessionTimedOut.signIn`)
    } as DialogMessageConfig;

    let dialogRef = this._dialogService.openMessage(dialogData, {
      id: 'session-timedout-dialog',
      backdropColor: 'black',
      size: 'medium',
      disableClose: true
    });

    dialogRef.afterClosed().pipe(
      tap(() => this._sessionHandlerService.renewSession())
    ).subscribe();
  }
}