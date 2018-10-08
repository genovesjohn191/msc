import {
  Component,
  Inject,
  ViewEncapsulation,
  TemplateRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  MCS_DIALOG_DATA,
  McsDialogRef
} from '@app/core';
import { McsStatusType } from '@app/utilities';
import { DialogMessageData } from './dialog-message-data';
import { DialogContentBase } from '../dialog-content.base';

@Component({
  selector: 'mcs-dialog-message',
  templateUrl: './dialog-message.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'dialog-message-wrapper'
  }
})

export class DialogMessageComponent extends DialogContentBase  {

  constructor(
    _changeDetectorRef: ChangeDetectorRef,
    public dialogRef: McsDialogRef<DialogMessageComponent>,
    @Inject(MCS_DIALOG_DATA) public dialogData: DialogMessageData
  ) {
    super(_changeDetectorRef);
    this.initializeDialog();
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
  protected get dialogType(): McsStatusType {
    return this.dialogData.type || 'info';
  }

  /**
   * Closes the displayed dialog
   */
  public closeDialog(): void {
    this.dialogRef.close();
  }
}
