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
import { ServerSnapshotDialogContent } from '../server-snapshot-dialog-content';

@Component({
  selector: 'mcs-delete-snapshot-dialog',
  templateUrl: './delete-snapshot.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'delete-snapshot-dialog-wrapper'
  }
})

export class DeleteSnapshotDialogComponent {
  public dialogModel: ServerSnapshotDialogContent;

  constructor(
    private _translateService: TranslateService,
    public dialogRef: McsDialogRef<DeleteSnapshotDialogComponent>,
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
   * Title text to be displayed in the dialog
   */
  public get titleText(): string {
    return this._translateService.instant(
      'serverShared.dialogDeleteSnapshot.title', { snapshot_name: this.dialogModel.snapshotName }
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
  public deleteSnapshot(): void {
    this.dialogRef.close(true);
  }
}
