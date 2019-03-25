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
import { ServerSnapshotDialogContent } from '../../server-snapshot-dialog-content';

@Component({
  selector: 'mcs-create-snapshot-dialog',
  templateUrl: './create-snapshot.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'create-snapshot-dialog-wrapper'
  }
})

export class CreateSnapshotDialogComponent {
  public dialogModel: ServerSnapshotDialogContent;

  constructor(
    private _translateService: TranslateService,
    public dialogRef: McsDialogRef<CreateSnapshotDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this.dialogModel = this.dialogData as ServerSnapshotDialogContent[][0];
  }

  /**
   * Warning icon key
   */
  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  /**
   * Confirmation message to be displayed in the dialog
   */
  public get confirmationMessage(): string {
    return this._translateService.instant(
      'serverShared.dialogCreateSnapshot.confirmation',
      { server_name: this.dialogModel.serverName }
    );
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
  public createSnapshot(): void {
    this.dialogRef.close(true);
  }
}
