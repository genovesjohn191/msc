import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { McsStatusType } from '@app/utilities';

import { DialogSettingsBase } from '../abstraction/dialog-settings.base';
import { DIALOG_DATA } from '../dialog-config';
import { DialogRef } from '../dialog-ref/dialog-ref';
import { DialogConfirmation } from './dialog-confirmation-data';

@Component({
  selector: 'mcs-dialog-confirmation',
  templateUrl: './dialog-confirmation.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'dialog-confirmation-wrapper'
  }
})
export class DialogConfirmationComponent extends DialogSettingsBase {

  constructor(
    _changeDetectorRef: ChangeDetectorRef,
    public dialogRef: DialogRef<DialogConfirmationComponent>,
    @Inject(DIALOG_DATA) public dialogData: DialogConfirmation<any>
  ) {
    super(_changeDetectorRef);
    this.initializeSettings();
  }

  /**
   * Returns the title of the confirmation dialog
   */
  public get dialogTitle(): string {
    return this.dialogData.title;
  }

  /**
   * Returns the message of the warning dialog
   */
  public get dialogMessage(): string | TemplateRef<any> {
    return this.dialogData.message;
  }

  /**
   * Returns true when the dialog message is a template
   */
  public get isMessageTemplate(): boolean {
    return this.dialogData.message instanceof TemplateRef;
  }

  /**
   * Returns the dialog type based on its status
   */
  protected get statusType(): McsStatusType {
    return this.dialogData.type || 'info';
  }

  /**
   * Returns the confirm text label of the dialog
   */
  public get confirmText(): string {
    return this.dialogData.confirmText || 'Confirm';
  }

  /**
   * Returns the cancel text label of the dialog
   */
  public get cancelText(): string {
    return this.dialogData.cancelText || 'Cancel';
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
