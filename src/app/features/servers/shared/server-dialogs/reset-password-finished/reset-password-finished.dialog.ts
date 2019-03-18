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
import { McsServerCredential } from '@app/models';

@Component({
  selector: 'mcs-reset-password-finished-dialog',
  templateUrl: './reset-password-finished.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'reset-password-finished-dialog-wrapper'
  }
})

export class ResetPasswordFinishedDialogComponent {

  public serverCredential: McsServerCredential;

  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  constructor(
    private _translateService: TranslateService,
    public dialogRef: McsDialogRef<ResetPasswordFinishedDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this.serverCredential = this.dialogData as McsServerCredential;
  }

  /**
   * Get Server Password information if it successully reset
   */
  public getPasswordInformation(): string {
    if (isNullOrEmpty(this.serverCredential)) { return ''; }

    return this._translateService.instant(
      'serverShared.dialogResetPasswordFinished.information',
      { server_name: this.serverCredential.server }
    );
  }

  /**
   * Close the current displayed dialog
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }
}
