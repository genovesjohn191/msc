import {
  Component,
  Inject,
  ViewEncapsulation
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef,
  CoreDefinition
} from '@app/core';
import { ServerSnapshotDialogContent } from '../../server-snapshot-dialog-content';

@Component({
  selector: 'mcs-disk-conflict-snapshot-dialog',
  templateUrl: './disk-conflict-snapshot.dialog.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'disk-conflict-snapshot-dialog-wrapper'
  }
})

export class DiskConflictSnapshotDialogComponent {
  public dialogModel: ServerSnapshotDialogContent;

  constructor(
    public dialogRef: McsDialogRef<DiskConflictSnapshotDialogComponent>,
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
   * Close the displayed dialog
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }
}
