import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  CoreDefinition,
  McsTextContentProvider
} from '../../../../../core';
import {
  isNullOrEmpty,
  replacePlaceholder
} from '../../../../../utilities';
import { ServerCredential } from '../../../models';

@Component({
  selector: 'mcs-reset-password-finished-dialog',
  templateUrl: './reset-password-finished.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'reset-password-finished-dialog-wrapper'
  }
})

export class ResetPasswordFinishedDialogComponent {
  public textContent: any;
  public serverCredential: ServerCredential;

  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  constructor(
    private _textContentProvider: McsTextContentProvider,
    public dialogRef: McsDialogRef<ResetPasswordFinishedDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this.textContent = this._textContentProvider.content.servers.shared.resetPasswordFinishedDialog;
    this.serverCredential = this.dialogData as ServerCredential;
  }

  /**
   * Get Server Password information if it successully reset
   */
  public getPasswordInformation(): string {
    if (isNullOrEmpty(this.serverCredential)) { return ''; }
    return replacePlaceholder(
      this.textContent.information,
      'server_name',
      this.serverCredential.server
    );
  }

  /**
   * Close the current displayed dialog
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }
}
