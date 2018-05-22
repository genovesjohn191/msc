import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  McsTextContentProvider,
  CoreDefinition
} from '../../../../../core';
import { replacePlaceholder } from '../../../../../utilities';
import { ServerSnapshotDialogContent } from '../../../models';

@Component({
  selector: 'mcs-restore-snapshot-dialog',
  templateUrl: './restore-snapshot.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'restore-snapshot-dialog-wrapper'
  }
})

export class RestoreSnapshotDialogComponent {
  public textContent: any;
  public dialogModel: ServerSnapshotDialogContent;

  constructor(
    private _textContentProvider: McsTextContentProvider,
    public dialogRef: McsDialogRef<RestoreSnapshotDialogComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData
  ) {
    this.textContent = this._textContentProvider.content.servers.shared.restoreSnapshotDialog;
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
    return replacePlaceholder(
      this.textContent.confirmation, [
        'snapshot_name',
        'server_name'
      ], [
        this.dialogModel.snapshotName,
        this.dialogModel.serverName
      ]);
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
  public restoreSnapshot(): void {
    this.dialogRef.close(true);
  }
}
