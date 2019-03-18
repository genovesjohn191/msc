import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  CoreDefinition
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsServer,
  VmPowerState
} from '@app/models';

@Component({
  selector: 'mcs-reset-password-dialog',
  templateUrl: './reset-password.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'reset-password-dialog-wrapper'
  }
})

export class ResetPasswordDialogComponent {
  public server: McsServer;

  public get powerStateEnum(): any {
    return VmPowerState;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  constructor(
    private _translateService: TranslateService,
    public dialogRef: McsDialogRef<ResetPasswordDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this.server = this.dialogData as McsServer[][0];
  }

  /**
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * This will close the dialog and set the dialog result to true
   */
  public resetPassword(): void {
    this.dialogRef.close(true);
  }

  /**
   * Get Server Powered On Information
   */
  public getPoweredOnInfo(): string {
    if (isNullOrEmpty(this.server)) { return ''; }

    return this._translateService.instant(
      'serverShared.dialogResetPassword.poweredOnInfo',
      { server_name: this.server.name }
    );
  }

  /**
   * Get Server Powered Off Information
   */
  public getPoweredOffInfo(): string {
    if (isNullOrEmpty(this.server)) { return ''; }

    return this._translateService.instant(
      'serverShared.dialogResetPassword.poweredOffInfo',
      { server_name: this.server.name }
    );
  }
}
