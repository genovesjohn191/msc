import {
  Component,
  Inject,
  ViewEncapsulation,
  TemplateRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { McsStatusSettingsBase } from '@app/core';
import { McsStatusType } from '@app/utilities';
import { DialogMessageConfig } from './dialog-message-config';
import { DialogRef } from '../dialog-ref/dialog-ref';
import { DIALOG_DATA } from '../dialog-config';

@Component({
  selector: 'mcs-dialog-message',
  templateUrl: './dialog-message.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'dialog-message-wrapper'
  }
})

export class DialogMessageComponent extends McsStatusSettingsBase  {

  constructor(
    _changeDetectorRef: ChangeDetectorRef,
    public dialogRef: DialogRef<DialogMessageComponent>,
    @Inject(DIALOG_DATA) public dialogData: DialogMessageConfig
  ) {
    super(_changeDetectorRef);
    this.initializeSettings();
  }

  /**
   * Returns the title of the message dialog
   */
  public get dialogTitle(): string {
    return this.dialogData.title;
  }

  /**
   * Returns the message of the message dialog
   */
  public get dialogMessage(): string | TemplateRef<any> {
    return this.dialogData.message;
  }

  /**
   * Returns true when the close button should be disable
   */
  public get disableClose(): boolean {
    return this.dialogRef.disableClose;
  }

  /**
   * Returns the ok text of the message dialog
   */
  public get okText(): string {
    return this.dialogData.okText || 'OK';
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
   * Closes the displayed dialog
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }
}
