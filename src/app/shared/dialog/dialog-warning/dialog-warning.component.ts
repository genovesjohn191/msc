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
import { isNullOrEmpty } from '@app/utilities';
import { DialogWarningData } from './dialog-warning-data';

@Component({
  selector: 'mcs-dialog-warning',
  templateUrl: './dialog-warning.component.html',
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'dialog-warning-wrapper'
  }
})

export class DialogWarningComponent {
  public textContent: any;

  constructor(
    public dialogRef: McsDialogRef<DialogWarningComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData: DialogWarningData<any>
  ) {
    if (isNullOrEmpty(dialogData)) {
      throw new Error(`Dialog data was not provided.`);
    }
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  /**
   * Returns the title of the warning dialog
   */
  public get dialogTitle(): string {
    return this.dialogData.title;
  }

  /**
   * Returns the message of the warning dialog
   */
  public get dialogMessage(): string {
    return this.dialogData.message;
  }

  /**
   * Closes the displayed dialog
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }

  /**
   * Confirms the warning dialog
   */
  public confirmDialog(): void {
    this.dialogRef.close(this.dialogData.data);
  }
}
