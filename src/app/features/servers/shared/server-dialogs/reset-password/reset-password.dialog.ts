import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  CoreDefinition,
  McsTextContentProvider,
  GoogleAnalyticsEventsService
} from '../../../../../core';
import {
  isNullOrEmpty,
  replacePlaceholder
} from '../../../../../utilities';
import {
  Server,
  ServerPowerState
} from '../../../models';

@Component({
  selector: 'mcs-reset-password-dialog',
  templateUrl: './reset-password.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'reset-password-dialog-wrapper'
  }
})

export class ResetPasswordDialogComponent {
  public textContent: any;
  public server: Server;

  public get powerStateEnum(): any {
    return ServerPowerState;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _ga: GoogleAnalyticsEventsService,
    public dialogRef: McsDialogRef<ResetPasswordDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this.textContent = this._textContentProvider.content.servers.shared.resetPasswordDialog;
    this.server = this.dialogData as Server[][0];
  }

  /**
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this._sendEventTracking('reset-password-cancel-click');
    this.dialogRef.close();
  }

  /**
   * This will close the dialog and set the dialog result to true
   */
  public resetPassword(): void {
    this._sendEventTracking('reset-password-confirm-click');
    this.dialogRef.close(true);
  }

  /**
   * Get Server Powered On Information
   */
  public getPoweredOnInfo(): string {
    if (isNullOrEmpty(this.server)) { return ''; }
    return replacePlaceholder(
      this.textContent.poweredOnInfo,
      'server_name',
      this.server.name
    );
  }

  /**
   * Get Server Powered Off Information
   */
  public getPoweredOffInfo(): string {
    if (isNullOrEmpty(this.server)) { return ''; }
    return replacePlaceholder(
      this.textContent.poweredOffInfo,
      'server_name',
      this.server.name
    );
  }

  private _sendEventTracking(event: string): void {
    this._ga.emitEvent('server', event, 'reset-password-dialog');
  }
}
