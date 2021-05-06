import {
  Component,
  Inject
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

@Component({
  selector: 'mcs-workflow-service-id-switch-dialog',
  templateUrl: './service-id-switch-dialog.component.html',
})
export class LaunchPadServiceIdSwitchDialogComponent {
  public serviceId: string;

  public constructor(
    public dialogRef: MatDialogRef<LaunchPadServiceIdSwitchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {
    this.serviceId = data;
  }
}
