import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  McsTextContentProvider,
  CoreDefinition,
  McsSessionHandlerService
} from '../../../../core';

@Component({
  selector: 'mcs-session-timeout-dialog',
  templateUrl: './session-timeout.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'session-timeout-dialog-wrapper'
  }
})

export class SessionTimeoutDialogComponent {
  public textContent: any;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    public dialogRef: McsDialogRef<SessionTimeoutDialogComponent>,
    private _sessionHandlerService: McsSessionHandlerService,
    @Inject(MCS_DIALOG_DATA) public dialogData: any
  ) {
    this.textContent = this._textContentProvider.content
      .pageNotifications.sessionHandler.sessionTimeoutDialog;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  /**
   * Redirect to sign-in page
   */
  public signIn(): void {
    this._sessionHandlerService.renewSession();
  }
}
