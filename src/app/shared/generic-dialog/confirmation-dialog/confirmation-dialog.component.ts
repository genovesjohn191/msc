import {
  Component,
  Inject
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  okText: string;
  cancelText: string;
}

@Component({
  selector: 'mcs-confirmation-dialog.component',
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogDialogComponent {
  public constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}
}
